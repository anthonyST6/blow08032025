#!/bin/bash

# Seraphim Vanguard Platform - Deployment Script
# This script automates the deployment process for production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
VERSION=${VERSION:-$(git rev-parse --short HEAD)}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check for required commands
    commands=("docker" "docker-compose" "git" "node" "npm")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed"
            exit 1
        fi
    done
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18 or higher"
        exit 1
    fi
    
    # Check for .env files
    if [ ! -f "packages/backend/.env" ]; then
        log_error "Backend .env file not found"
        log_info "Copy packages/backend/.env.example to packages/backend/.env and configure it"
        exit 1
    fi
    
    if [ ! -f "packages/frontend/.env" ]; then
        log_error "Frontend .env file not found"
        log_info "Copy packages/frontend/.env.example to packages/frontend/.env and configure it"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    npm ci
    
    # Install backend dependencies
    cd packages/backend
    npm ci
    cd ../..
    
    # Install frontend dependencies
    cd packages/frontend
    npm ci
    cd ../..
    
    log_info "Dependencies installed"
}

run_tests() {
    log_info "Running tests..."
    
    # Run backend tests
    cd packages/backend
    npm test -- --passWithNoTests
    cd ../..
    
    # Run frontend tests
    cd packages/frontend
    npm test -- --passWithNoTests
    cd ../..
    
    # Run E2E tests (optional for production deployment)
    if [ "$ENVIRONMENT" != "production" ]; then
        npm run test:e2e -- --reporter=list
    fi
    
    log_info "Tests completed"
}

build_application() {
    log_info "Building application..."
    
    # Build backend
    cd packages/backend
    npm run build
    cd ../..
    
    # Build frontend
    cd packages/frontend
    npm run build
    cd ../..
    
    log_info "Application built successfully"
}

build_docker_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    docker build -t seraphim-backend:$VERSION ./packages/backend
    docker tag seraphim-backend:$VERSION seraphim-backend:latest
    
    # Build frontend image
    docker build -t seraphim-frontend:$VERSION ./packages/frontend
    docker tag seraphim-frontend:$VERSION seraphim-frontend:latest
    
    # Tag for registry if provided
    if [ -n "$DOCKER_REGISTRY" ]; then
        docker tag seraphim-backend:$VERSION $DOCKER_REGISTRY/seraphim-backend:$VERSION
        docker tag seraphim-backend:$VERSION $DOCKER_REGISTRY/seraphim-backend:latest
        docker tag seraphim-frontend:$VERSION $DOCKER_REGISTRY/seraphim-frontend:$VERSION
        docker tag seraphim-frontend:$VERSION $DOCKER_REGISTRY/seraphim-frontend:latest
    fi
    
    log_info "Docker images built"
}

push_docker_images() {
    if [ -n "$DOCKER_REGISTRY" ]; then
        log_info "Pushing Docker images to registry..."
        
        docker push $DOCKER_REGISTRY/seraphim-backend:$VERSION
        docker push $DOCKER_REGISTRY/seraphim-backend:latest
        docker push $DOCKER_REGISTRY/seraphim-frontend:$VERSION
        docker push $DOCKER_REGISTRY/seraphim-frontend:latest
        
        log_info "Docker images pushed"
    else
        log_warn "No Docker registry configured, skipping push"
    fi
}

backup_current_deployment() {
    log_info "Creating backup of current deployment..."
    
    # Create backup directory
    BACKUP_DIR="backups/deployment_$TIMESTAMP"
    mkdir -p $BACKUP_DIR
    
    # Backup docker volumes
    if docker volume ls | grep -q seraphim; then
        docker run --rm -v seraphim-backend-logs:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/backend-logs.tar.gz -C /data .
        docker run --rm -v seraphim-frontend-logs:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/frontend-logs.tar.gz -C /data .
    fi
    
    # Backup current configuration
    cp docker-compose.yml $BACKUP_DIR/ 2>/dev/null || true
    cp docker-compose.prod.yml $BACKUP_DIR/ 2>/dev/null || true
    
    log_info "Backup created in $BACKUP_DIR"
}

deploy_application() {
    log_info "Deploying application..."
    
    # Stop current deployment
    docker-compose -f docker-compose.prod.yml down
    
    # Start new deployment
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_error "Services failed to start"
        rollback_deployment
        exit 1
    fi
    
    log_info "Application deployed successfully"
}

rollback_deployment() {
    log_error "Rolling back deployment..."
    
    # Stop failed deployment
    docker-compose -f docker-compose.prod.yml down
    
    # Restore previous version
    docker tag seraphim-backend:previous seraphim-backend:latest
    docker tag seraphim-frontend:previous seraphim-frontend:latest
    
    # Start previous version
    docker-compose -f docker-compose.prod.yml up -d
    
    log_info "Rollback completed"
}

run_post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    # Check backend health
    if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if ! curl -f http://localhost > /dev/null 2>&1; then
        log_error "Frontend health check failed"
        return 1
    fi
    
    # Check WebSocket
    if ! curl -f http://localhost:3001/socket.io/ > /dev/null 2>&1; then
        log_warn "WebSocket check failed (this might be normal)"
    fi
    
    log_info "Post-deployment checks passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old backups (keep last 5)
    if [ -d "backups" ]; then
        ls -t backups | tail -n +6 | xargs -I {} rm -rf backups/{}
    fi
    
    log_info "Cleanup completed"
}

# Main deployment flow
main() {
    log_info "Starting Seraphim Vanguard deployment for $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    # Tag current images as previous for rollback
    docker tag seraphim-backend:latest seraphim-backend:previous 2>/dev/null || true
    docker tag seraphim-frontend:latest seraphim-frontend:previous 2>/dev/null || true
    
    check_prerequisites
    install_dependencies
    run_tests
    build_application
    build_docker_images
    push_docker_images
    backup_current_deployment
    deploy_application
    
    if run_post_deployment_checks; then
        cleanup
        log_info "Deployment completed successfully!"
        log_info "Application is running at https://seraphim-vanguard.com"
    else
        log_error "Post-deployment checks failed"
        rollback_deployment
        exit 1
    fi
}

# Run main function
main