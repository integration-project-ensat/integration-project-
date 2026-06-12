#!/bin/bash


# mise en chemin des fichiers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/gitlab-sync-$(date +%Y-%m-%d).log"

# Log directory setup
mkdir -p "$LOG_DIR"

# Charger l'environnement
if [[ ! -f "$PROJECT_DIR/.env.gitlab-sync.local" ]]; then
    echo "Error: .env.gitlab-sync.local not found in $PROJECT_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

source "$PROJECT_DIR/.env.gitlab-sync.local"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "GitLab Role Sync Job Started"
log "========================================="
log "Project Dir: $PROJECT_DIR"
log "Group ID: $GROUP_ID"
log "Project ID: $PROJECT_ID"
log

# Run sync
cd "$PROJECT_DIR"

if bash sync-gitlab-roles.sh --group-id "$GROUP_ID" --project-id "$PROJECT_ID" 2>&1 | tee -a "$LOG_FILE"; then
    log "✓ Sync completed successfully"
    exit 0
else
    log "✗ Sync failed with exit code $?"
    exit 1
fi
