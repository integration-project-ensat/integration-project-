#!/bin/bash


set -euo pipefail


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' 

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/.env.gitlab-sync" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$SCRIPT_DIR/.env.gitlab-sync"
  set +a
fi

if [[ -f "$SCRIPT_DIR/.env.gitlab-sync.local" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$SCRIPT_DIR/.env.gitlab-sync.local"
  set +a
fi

: "${GITLAB_TOKEN:?Missing GITLAB_TOKEN}"
: "${GITLAB_URL:=http://localhost:9080}"
: "${GROUP_ID:=}"
: "${PROJECT_ID:=}"
GITLAB_TOKEN="${GITLAB_TOKEN%[[:space:]]}"
GITLAB_URL="${GITLAB_URL%[[:space:]]}"
GROUP_ID="${GROUP_ID%[[:space:]]}"
PROJECT_ID="${PROJECT_ID%[[:space:]]}"
DRY_RUN="${DRY_RUN:-false}"

# Check dry-run 
while [[ $# -gt 0 ]]; do
  case $1 in
    --group-id)
      GROUP_ID="$2"
      shift 2
      ;;
    --project-id)
      PROJECT_ID="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--group-id <id>] [--project-id <id>] [--dry-run]"
      exit 1
      ;;
  esac
done

# Validation de parametres requies
if [[ -z "$GROUP_ID" && -z "$PROJECT_ID" ]]; then
  echo -e "${RED}Error: Must provide either --group-id or --project-id (or both)${NC}"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}GitLab Role Synchronization Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "GitLab URL: ${BLUE}$GITLAB_URL${NC}"
[[ -n "$GROUP_ID" ]] && echo -e "Group ID: ${BLUE}$GROUP_ID${NC}"
[[ -n "$PROJECT_ID" ]] && echo -e "Project ID: ${BLUE}$PROJECT_ID${NC}"
[[ "$DRY_RUN" == "true" ]] && echo -e "${YELLOW}DRY RUN MODE (no changes will be made)${NC}"
echo

# Mapping
declare -A TEAM_MEMBERS=(
  # Owners
  ["chef-equipe"]=50
  ["adjoint"]=50
  # Maintainers (DevOps)
  ["devops1"]=40
  ["devops2"]=40
  # Developers
  ["dev-frontend"]=30
  ["dev-backend"]=30
  ["qa1"]=30
  ["qa2"]=30
  ["securite1"]=30
  ["securite2"]=30
)


# Helper Functions


# API call GitLab
api_call() {
  local method=$1
  local endpoint=$2

  local url="${GITLAB_URL}/api/v4${endpoint}"
  local response

  response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN")

  local http_code
  http_code=$(echo "$response" | tail -n 1)
  local body
  body=$(echo "$response" | sed '$d')

  echo "$body|$http_code"
}

# Recherche par nom d'utilisateur
find_gitlab_user() {
  local username=$1

  local response
  response=$(api_call GET "/users?username=$username")
  local body=$(echo "$response" | cut -d'|' -f1)
  local http_code=$(echo "$response" | cut -d'|' -f2)
  
  if [[ "$http_code" == "200" ]]; then
    echo "$body" | sed -n 's/.*"id":[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -n 1
  fi
}

# creaction GitLab user
create_gitlab_user() {
  local username=$1
  local email=${2:-"${username}@portfolio.local"}
  local name=${3:-"$username"}

  local url="${GITLAB_URL}/api/v4/users"
  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    --data-urlencode "username=$username" \
    --data-urlencode "email=$email" \
    --data-urlencode "name=$name" \
    --data-urlencode "skip_confirmation=true")

  local http_code
  http_code=$(echo "$response" | tail -n 1)
  local body
  body=$(echo "$response" | sed '$d')
  
  if [[ "$http_code" == "201" ]]; then
    echo "$body" | sed -n 's/.*"id":[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -n 1
  elif [[ "$http_code" == "400" ]]; then
    # User likely already exists
    return 1
  else
    echo "Error creating user: HTTP $http_code" >&2
    return 1
  fi
}

# Insertion user -> group
add_user_to_group() {
  local user_id=$1
  local group_id=$2
  local access_level=$3

  local url="${GITLAB_URL}/api/v4/groups/$group_id/members"
  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    --data-urlencode "user_id=$user_id" \
    --data-urlencode "access_level=$access_level")

  local http_code
  http_code=$(echo "$response" | tail -n 1)
  
  if [[ "$http_code" == "201" ]]; then
    return 0
  elif [[ "$http_code" == "409" ]]; then
    # User already member, update access level
    update_group_member_access "$group_id" "$user_id" "$access_level"
    return $?
  else
    return 1
  fi
}

# user -> project
add_user_to_project() {
  local user_id=$1
  local project_id=$2
  local access_level=$3

  local url="${GITLAB_URL}/api/v4/projects/$project_id/members"
  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    --data-urlencode "user_id=$user_id" \
    --data-urlencode "access_level=$access_level")

  local http_code
  http_code=$(echo "$response" | tail -n 1)
  
  if [[ "$http_code" == "201" ]]; then
    return 0
  elif [[ "$http_code" == "409" ]]; then
    # User already member, update access level
    update_project_member_access "$project_id" "$user_id" "$access_level"
    return $?
  else
    return 1
  fi
}

# Niveau d'acces des membres de groupe (updated)
update_group_member_access() {
  local group_id=$1
  local user_id=$2
  local access_level=$3

  local url="${GITLAB_URL}/api/v4/groups/$group_id/members/$user_id"
  local response
  response=$(curl -s -w "\n%{http_code}" -X PUT "$url" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    --data-urlencode "access_level=$access_level")

  local http_code
  http_code=$(echo "$response" | tail -n 1)
  
  [[ "$http_code" == "200" ]]
}

# Niveau d'acces des memebres de projet (updated)
update_project_member_access() {
  local project_id=$1
  local user_id=$2
  local access_level=$3

  local url="${GITLAB_URL}/api/v4/projects/$project_id/members/$user_id"
  local response
  response=$(curl -s -w "\n%{http_code}" -X PUT "$url" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    --data-urlencode "access_level=$access_level")

  local http_code
  http_code=$(echo "$response" | tail -n 1)
  
  [[ "$http_code" == "200" ]]
}

# Nom de role /  niveau d'acces
get_role_name() {
  local level=$1
  case $level in
    50) echo "Owner" ;;
    40) echo "Maintainer" ;;
    30) echo "Developer" ;;
    20) echo "Reporter" ;;
    10) echo "Guest" ;;
    *) echo "Unknown" ;;
  esac
}


# Main Sync Logic


TOTAL=0
CREATED=0
UPDATED=0
FAILED=0

echo -e "${BLUE}Starting synchronization...${NC}\n"

for username in "${!TEAM_MEMBERS[@]}"; do
  access_level=${TEAM_MEMBERS[$username]}
  role_name=$(get_role_name "$access_level")
  
  ((TOTAL+=1))
  echo -n "Processing ${BLUE}$username${NC} ($role_name)... "
  
  # Step 1: Find or create user
  user_id=$(find_gitlab_user "$username")
  
  if [[ -z "$user_id" ]]; then
    echo -n "creating user... "
    if [[ "$DRY_RUN" == "true" ]]; then
      echo -n "(dry-run) "
      user_id="SIMULATED_ID_$username"
    else
      user_id=$(create_gitlab_user "$username" "${username}@portfolio.local" "$username")
      if [[ -z "$user_id" ]]; then
        echo -e "${RED}✗ Failed to create user${NC}"
        ((FAILED++))
        continue
      fi
    fi
    ((CREATED+=1))
  fi
  
  #     ajout a group (specified)
  if [[ -n "$GROUP_ID" ]]; then
    echo -n "adding to group... "
    if [[ "$DRY_RUN" == "true" ]]; then
      echo -n "(dry-run) "
    else
      if add_user_to_group "$user_id" "$GROUP_ID" "$access_level"; then
        ((UPDATED+=1))
      else
        echo -e "${RED}✗ Failed to add to group${NC}"
        ((FAILED+=1))
        continue
      fi
    fi
  fi
  
  #  Ajout au projet (specified)
  if [[ -n "$PROJECT_ID" ]]; then
    echo -n "adding to project... "
    if [[ "$DRY_RUN" == "true" ]]; then
      echo -n "(dry-run) "
    else
      if add_user_to_project "$user_id" "$PROJECT_ID" "$access_level"; then
        ((UPDATED+=1))
      else
        echo -e "${RED}✗ Failed to add to project${NC}"
        ((FAILED+=1))
        continue
      fi
    fi
  fi
  
  echo -e "${GREEN}✓${NC}"
done

# Summary

echo
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Synchronization Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "Total processed: ${BLUE}$TOTAL${NC}"
echo -e "Users created:   ${GREEN}$CREATED${NC}"
echo -e "Members updated: ${GREEN}$UPDATED${NC}"
[[ $FAILED -gt 0 ]] && echo -e "Failed:          ${RED}$FAILED${NC}" || echo -e "Failed:          ${GREEN}0${NC}"
echo

if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "${YELLOW}DRY RUN COMPLETED${NC} - No changes were made to GitLab"
  echo "To apply changes, run again without --dry-run flag"
fi

exit $([[ $FAILED -eq 0 ]] && echo 0 || echo 1)
