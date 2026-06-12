#!/bin/bash
# Quick setup script : GitLab role synchronization

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     GitLab Role Sync - Quick Setup                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

# prerequisites
echo "Checking prerequisites..."

if ! command -v curl &> /dev/null; then
    echo "curl not found. Please install: brew install curl"
    exit 1
fi

echo "curl installed"
echo

# Creation de local configuration file
if [[ -f ".env.gitlab-sync.local" ]]; then
    echo "⚠ .env.gitlab-sync.local already exists. Skipping..."
else
    echo "Creating .env.gitlab-sync.local..."
    cp .env.gitlab-sync .env.gitlab-sync.local
    echo "  ✓ Created"
fi

echo
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ SETUP STEPS                                                │"
echo "└────────────────────────────────────────────────────────────┘"
echo
echo "1  Get your GitLab Admin Token:"
echo "   • Go to: http://localhost:9080/admin/personal_access_tokens"
echo "   • Create token with scopes: api, read_api, write_repository, admin"
echo "   • Copy the token"
echo
echo "2  Find your Group/Project IDs:"
echo "   • Group: http://localhost:9080/groups/your-group/-/edit"
echo "   • Project: http://localhost:9080/your-group/your-project/-/edit"
echo
echo "3  Edit the configuration:"
echo "   nano .env.gitlab-sync.local"
echo
echo "   Update:"
echo "   GITLAB_TOKEN=<your_token>"
echo "   GITLAB_URL=http://localhost:9080"
echo "   GROUP_ID=<your_group_id>"
echo "   PROJECT_ID=<your_project_id>"
echo
echo "4  Make script executable:"
echo "   chmod +x sync-gitlab-roles.sh"
echo
echo "5  Test with dry-run:"
echo "   source .env.gitlab-sync.local"
echo "   bash sync-gitlab-roles.sh --group-id \$GROUP_ID --dry-run"
echo
echo "6  Run sync (for real):"
echo "   bash sync-gitlab-roles.sh --group-id \$GROUP_ID --project-id \$PROJECT_ID"
echo
echo " Full documentation: GITLAB_SYNC_README.md"
echo

read -p "Press Enter to continue..."
