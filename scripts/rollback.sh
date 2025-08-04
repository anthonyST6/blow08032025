#!/bin/bash

# Seraphim Vanguard Platform - Rollback Script
# This script handles rollback to previous deployment versions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="backups"
DOCKER_COMPOSE_FILE=${DOCKER_COMPOSE_FILE:-"docker-compose.prod.yml"}

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_prompt() {
    echo -e "${BLUE}[PROMPT]${NC} $1"
}

# List available backups
list_backups() {
    log_info "Available backups:"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -la $BACKUP_DIR | grep "deployment_" | awk '{print NR". "$9" - "$6" "$7" "$8}'
    else
        log_error "No backup directory found"
        exit 1
    fi
}

# Select backup to restore
select_backup() {
    list_backups
    echo ""
    log_prompt "Enter the number of the backup to restore (or 'q' to quit):"
    read -r selection
    
    if [[ "$selection" == "q" ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
    
    BACKUP_NAME=$(ls $BACKUP_DIR | grep "deployment_" | sed -n "${selection}p")
    
    if [ -z "$BACKUP_NAME" ]; then
        log_error "Invalid selection"
        exit 1
    fi
    
    SELECTED_BACKUP="$BACKUP_DIR/$BACKUP_NAME"
    log_info "Selected backup: $SELECTED_BACKUP"
}

# Confirm rollback
confirm_rollback() {
    log_warn "This will rollback to: $BACKUP_NAME"
    log_warn "Current deployment will be stopped and replaced"
    echo ""
    log_prompt "Are you sure you want to continue? (yes/no)"
    read -r confirmation
    
    if [[ "$confirmation" != "yes" ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
}

# Create backup of current state
backup_current() {
    log_info "Creating backup of current deployment..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    CURRENT_BACKUP="$BACKUP_DIR/deployment_rollback_$TIMESTAMP"
    mkdir -p "$CURRENT_BACKUP"
    
    # Backup current docker-compose files
    cp docker-compose.yml "$CURRENT_BACKUP/" 2>/dev/null || true
    cp docker-compose.prod.yml "$CURRENT_BACKUP/" 2>/dev/null || true
    
    # Save current container info
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$CURRENT_BACKUP/container_status.txt"
    
    # Export current images
    log_info "Exporting current Docker images..."
    docker save seraphim-backend:latest -o "$CURRENT_BACKUP/backend-image.tar"
    docker save seraphim-frontend:latest -o "$CURRENT_BACKUP/frontend-image.tar"
    
    log_info "Current state backed up to: $CURRENT_BACKUP"
}

# Stop current deployment
stop_deployment() {
    log_info "Stopping current deployment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Wait for containers to stop
    sleep 5
    
    # Force stop if needed
    docker ps | grep seraphim | awk '{print $1}' | xargs -r docker stop
    
    log_info "Current deployment stopped"
}

# Restore Docker images
restore_images() {
    log_info "Restoring Docker images from backup..."
    
    if [ -f "$SELECTED_BACKUP/backend-image.tar" ]; then
        docker load -i "$SELECTED_BACKUP/backend-image.tar"
        log_info "Backend image restored"
    else
        log_warn "Backend image backup not found"
    fi
    
    if [ -f "$SELECTED_BACKUP/frontend-image.tar" ]; then
        docker load -i "$SELECTED_BACKUP/frontend-image.tar"
        log_info "Frontend image restored"
    else
        log_warn "Frontend image backup not found"
    fi
}

# Restore volumes
restore_volumes() {
    log_info "Restoring Docker volumes..."
    
    # Restore backend logs
    if [ -f "$SELECTED_BACKUP/backend-logs.tar.gz" ]; then
        docker run --rm -v seraphim-backend-logs:/data -v $(pwd)/$SELECTED_BACKUP:/backup alpine \
            sh -c "cd /data && tar xzf /backup/backend-logs.tar.gz"
        log_info "Backend logs restored"
    fi
    
    # Restore frontend logs
    if [ -f "$SELECTED_BACKUP/frontend-logs.tar.gz" ]; then
        docker run --rm -v seraphim-frontend-logs:/data -v $(pwd)/$SELECTED_BACKUP:/backup alpine \
            sh -c "cd /data && tar xzf /backup/frontend-logs.tar.gz"
        log_info "Frontend logs restored"
    fi
}

# Restore configuration
restore_config() {
    log_info "Restoring configuration files..."
    
    # Restore docker-compose files
    if [ -f "$SELECTED_BACKUP/docker-compose.yml" ]; then
        cp "$SELECTED_BACKUP/docker-compose.yml" .
        log_info "docker-compose.yml restored"
    fi
    
    if [ -f "$SELECTED_BACKUP/docker-compose.prod.yml" ]; then
        cp "$SELECTED_BACKUP/docker-compose.prod.yml" .
        log_info "docker-compose.prod.yml restored"
    fi
}

# Start restored deployment
start_deployment() {
    log_info "Starting restored deployment..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check status
    docker-compose -f $DOCKER_COMPOSE_FILE ps
}

# Verify rollback
verify_rollback() {
    log_info "Verifying rollback..."
    
    # Run health checks
    if [ -f "scripts/health-check.sh" ]; then
        bash scripts/health-check.sh
    else
        # Basic health check
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_info "Backend is responding"
        else
            log_error "Backend health check failed"
        fi
        
        if curl -f http://localhost > /dev/null 2>&1; then
            log_info "Frontend is responding"
        else
            log_error "Frontend health check failed"
        fi
    fi
}

# Quick rollback using Docker tags
quick_rollback() {
    log_info "Performing quick rollback using previous Docker tags..."
    
    # Stop current containers
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Retag previous images as latest
    docker tag seraphim-backend:previous seraphim-backend:latest
    docker tag seraphim-frontend:previous seraphim-frontend:latest
    
    # Start with previous images
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    log_info "Quick rollback completed"
}

# Main rollback flow
main() {
    log_info "Seraphim Vanguard Platform Rollback Tool"
    echo "========================================"
    echo ""
    
    # Check if quick rollback is requested
    if [[ "$1" == "--quick" ]]; then
        log_info "Performing quick rollback..."
        quick_rollback
        verify_rollback
        exit 0
    fi
    
    # Full rollback process
    select_backup
    confirm_rollback
    backup_current
    stop_deployment
    
    # Restore from backup
    restore_images
    restore_volumes
    restore_config
    
    # Start and verify
    start_deployment
    verify_rollback
    
    log_info "Rollback completed!"
    log_info "Previous deployment has been restored from: $BACKUP_NAME"
    echo ""
    log_warn "If issues persist, you can rollback to another backup or check logs"
}

# Show usage
if [[ "$1" == "--help" ]]; then
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick    Perform quick rollback to previous Docker images"
    echo "  --help     Show this help message"
    echo ""
    echo "Without options, the script will show available backups for selection"
    exit 0
fi

# Run main function
main "$@"