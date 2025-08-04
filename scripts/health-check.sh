#!/bin/bash

# Seraphim Vanguard Platform - Health Check Script
# This script performs comprehensive health checks on all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost"}
REDIS_HOST=${REDIS_HOST:-"localhost"}
REDIS_PORT=${REDIS_PORT:-"6379"}
TIMEOUT=${TIMEOUT:-5}

# Health check results
HEALTH_STATUS=0

# Functions
log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    HEALTH_STATUS=1
}

# Check backend API
check_backend() {
    echo "Checking Backend API..."
    
    # Health endpoint
    if curl -f -s --connect-timeout $TIMEOUT "$BACKEND_URL/health" > /dev/null; then
        log_info "Backend health endpoint is responding"
    else
        log_error "Backend health endpoint is not responding"
    fi
    
    # API endpoint
    if curl -f -s --connect-timeout $TIMEOUT "$BACKEND_URL/api/v1/status" > /dev/null; then
        log_info "Backend API is accessible"
    else
        log_warn "Backend API status endpoint is not responding"
    fi
    
    # WebSocket endpoint
    if curl -f -s --connect-timeout $TIMEOUT "$BACKEND_URL/socket.io/" > /dev/null; then
        log_info "WebSocket server is accessible"
    else
        log_warn "WebSocket server is not responding"
    fi
}

# Check frontend
check_frontend() {
    echo -e "\nChecking Frontend..."
    
    # Main page
    if curl -f -s --connect-timeout $TIMEOUT "$FRONTEND_URL" > /dev/null; then
        log_info "Frontend is serving pages"
    else
        log_error "Frontend is not accessible"
    fi
    
    # Static assets
    if curl -f -s --connect-timeout $TIMEOUT "$FRONTEND_URL/assets/index.js" > /dev/null; then
        log_info "Frontend assets are being served"
    else
        log_warn "Frontend assets might not be properly served"
    fi
}

# Check Redis
check_redis() {
    echo -e "\nChecking Redis..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; then
            log_info "Redis is responding to ping"
            
            # Check Redis memory
            USED_MEMORY=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
            log_info "Redis memory usage: $USED_MEMORY"
        else
            log_error "Redis is not responding"
        fi
    else
        log_warn "redis-cli not found, skipping Redis checks"
    fi
}

# Check Docker containers
check_docker() {
    echo -e "\nChecking Docker Containers..."
    
    if command -v docker &> /dev/null; then
        # Check if containers are running
        BACKEND_STATUS=$(docker ps --filter "name=seraphim-backend" --format "{{.Status}}" | head -n1)
        if [[ $BACKEND_STATUS == *"Up"* ]]; then
            log_info "Backend container is running: $BACKEND_STATUS"
        else
            log_error "Backend container is not running"
        fi
        
        FRONTEND_STATUS=$(docker ps --filter "name=seraphim-frontend" --format "{{.Status}}" | head -n1)
        if [[ $FRONTEND_STATUS == *"Up"* ]]; then
            log_info "Frontend container is running: $FRONTEND_STATUS"
        else
            log_error "Frontend container is not running"
        fi
        
        REDIS_STATUS=$(docker ps --filter "name=seraphim-redis" --format "{{.Status}}" | head -n1)
        if [[ $REDIS_STATUS == *"Up"* ]]; then
            log_info "Redis container is running: $REDIS_STATUS"
        else
            log_error "Redis container is not running"
        fi
        
        # Check container resource usage
        echo -e "\nContainer Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep seraphim || true
    else
        log_warn "Docker not found, skipping container checks"
    fi
}

# Check disk space
check_disk_space() {
    echo -e "\nChecking Disk Space..."
    
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        log_info "Disk usage is at ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        log_warn "Disk usage is at ${DISK_USAGE}% - Consider cleanup"
    else
        log_error "Disk usage is critical at ${DISK_USAGE}%"
    fi
}

# Check SSL certificates
check_ssl() {
    echo -e "\nChecking SSL Certificates..."
    
    if [ -f "ssl/cert.pem" ]; then
        CERT_EXPIRY=$(openssl x509 -enddate -noout -in ssl/cert.pem | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            log_info "SSL certificate expires in $DAYS_LEFT days"
        elif [ $DAYS_LEFT -gt 7 ]; then
            log_warn "SSL certificate expires in $DAYS_LEFT days - Plan renewal"
        else
            log_error "SSL certificate expires in $DAYS_LEFT days - Urgent renewal needed"
        fi
    else
        log_warn "SSL certificate not found"
    fi
}

# Check logs for errors
check_logs() {
    echo -e "\nChecking Recent Logs..."
    
    # Check backend logs
    if [ -d "packages/backend/logs" ]; then
        ERROR_COUNT=$(find packages/backend/logs -name "*.log" -mtime -1 -exec grep -i "error" {} \; 2>/dev/null | wc -l)
        if [ $ERROR_COUNT -eq 0 ]; then
            log_info "No errors in recent backend logs"
        else
            log_warn "Found $ERROR_COUNT errors in recent backend logs"
        fi
    fi
    
    # Check Docker logs
    if command -v docker &> /dev/null; then
        BACKEND_ERRORS=$(docker logs seraphim-backend --since 1h 2>&1 | grep -i error | wc -l)
        if [ $BACKEND_ERRORS -eq 0 ]; then
            log_info "No errors in recent backend container logs"
        else
            log_warn "Found $BACKEND_ERRORS errors in backend container logs"
        fi
    fi
}

# Performance check
check_performance() {
    echo -e "\nChecking Performance..."
    
    # Test backend response time
    if command -v curl &> /dev/null; then
        RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$BACKEND_URL/health")
        RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d. -f1)
        
        if [ "$RESPONSE_MS" -lt 200 ]; then
            log_info "Backend response time: ${RESPONSE_MS}ms"
        elif [ "$RESPONSE_MS" -lt 500 ]; then
            log_warn "Backend response time: ${RESPONSE_MS}ms - Slightly slow"
        else
            log_error "Backend response time: ${RESPONSE_MS}ms - Performance issue"
        fi
    fi
}

# Generate health report
generate_report() {
    echo -e "\n========================================="
    echo "Health Check Summary"
    echo "========================================="
    echo "Timestamp: $(date)"
    echo "Environment: ${ENVIRONMENT:-development}"
    
    if [ $HEALTH_STATUS -eq 0 ]; then
        echo -e "Overall Status: ${GREEN}HEALTHY${NC}"
    else
        echo -e "Overall Status: ${RED}UNHEALTHY${NC}"
    fi
    
    echo "========================================="
}

# Main health check flow
main() {
    echo "Seraphim Vanguard Platform Health Check"
    echo "======================================="
    
    check_backend
    check_frontend
    check_redis
    check_docker
    check_disk_space
    check_ssl
    check_logs
    check_performance
    
    generate_report
    
    exit $HEALTH_STATUS
}

# Run main function
main