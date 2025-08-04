#!/bin/bash

# Seraphim Vanguard Platform - Monitoring Script
# This script provides real-time monitoring of the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REFRESH_INTERVAL=${REFRESH_INTERVAL:-5}
BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost"}

# Monitoring state
MONITORING=true

# Functions
log_header() {
    echo -e "${CYAN}$1${NC}"
}

log_metric() {
    echo -e "${BLUE}$1:${NC} $2"
}

log_status() {
    if [[ "$2" == "UP" ]]; then
        echo -e "$1: ${GREEN}$2${NC}"
    else
        echo -e "$1: ${RED}$2${NC}"
    fi
}

# Clear screen and show header
show_header() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         Seraphim Vanguard Platform Monitor                 ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo -e "Timestamp: $(date)"
    echo -e "Refresh: ${REFRESH_INTERVAL}s | Press Ctrl+C to exit"
    echo ""
}

# Check service status
check_service_status() {
    local service=$1
    local url=$2
    
    if curl -f -s --connect-timeout 2 "$url" > /dev/null; then
        echo "UP"
    else
        echo "DOWN"
    fi
}

# Get container stats
get_container_stats() {
    if command -v docker &> /dev/null; then
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null | grep seraphim || echo "No containers running"
    else
        echo "Docker not available"
    fi
}

# Get system metrics
get_system_metrics() {
    # CPU usage
    if command -v top &> /dev/null; then
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
        log_metric "CPU Usage" "${CPU_USAGE}%"
    fi
    
    # Memory usage
    if command -v free &> /dev/null; then
        MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
        log_metric "Memory Usage" "${MEM_USAGE}%"
    fi
    
    # Disk usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
    log_metric "Disk Usage" "$DISK_USAGE"
    
    # Load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
    log_metric "Load Average" "$LOAD_AVG"
}

# Get application metrics
get_app_metrics() {
    # Try to get metrics from backend
    if command -v curl &> /dev/null; then
        METRICS=$(curl -s "$BACKEND_URL/api/v1/metrics" 2>/dev/null || echo "{}")
        
        # Parse metrics if available
        if [[ "$METRICS" != "{}" ]]; then
            echo "$METRICS" | jq -r '. | to_entries | .[] | "\(.key): \(.value)"' 2>/dev/null || echo "Metrics parsing failed"
        else
            echo "No metrics available"
        fi
    fi
}

# Monitor logs
monitor_logs() {
    log_header "Recent Errors (Last 5 minutes)"
    
    # Check backend logs
    if [ -d "packages/backend/logs" ]; then
        find packages/backend/logs -name "*.log" -mmin -5 -exec grep -i "error" {} \; 2>/dev/null | tail -5 || echo "No recent errors"
    fi
    
    # Check Docker logs
    if command -v docker &> /dev/null; then
        echo ""
        log_header "Container Logs (Recent)"
        docker logs seraphim-backend --tail 5 --since 5m 2>&1 | grep -i "error" || echo "No recent container errors"
    fi
}

# Real-time monitoring display
monitor_display() {
    while $MONITORING; do
        show_header
        
        # Service Status
        log_header "Service Status"
        BACKEND_STATUS=$(check_service_status "Backend" "$BACKEND_URL/health")
        FRONTEND_STATUS=$(check_service_status "Frontend" "$FRONTEND_URL")
        REDIS_STATUS=$(check_service_status "Redis" "http://localhost:6379")
        
        log_status "Backend API" "$BACKEND_STATUS"
        log_status "Frontend" "$FRONTEND_STATUS"
        log_status "Redis Cache" "$REDIS_STATUS"
        echo ""
        
        # System Metrics
        log_header "System Metrics"
        get_system_metrics
        echo ""
        
        # Container Stats
        log_header "Container Statistics"
        get_container_stats
        echo ""
        
        # Application Metrics
        log_header "Application Metrics"
        get_app_metrics
        echo ""
        
        # Recent Errors
        monitor_logs
        
        # Wait for refresh
        sleep $REFRESH_INTERVAL
    done
}

# Export metrics to file
export_metrics() {
    local output_file="monitoring_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Seraphim Vanguard Platform Monitoring Report"
        echo "Generated: $(date)"
        echo "========================================"
        echo ""
        
        echo "Service Status"
        echo "--------------"
        echo "Backend: $(check_service_status 'Backend' '$BACKEND_URL/health')"
        echo "Frontend: $(check_service_status 'Frontend' '$FRONTEND_URL')"
        echo "Redis: $(check_service_status 'Redis' 'http://localhost:6379')"
        echo ""
        
        echo "System Metrics"
        echo "--------------"
        get_system_metrics
        echo ""
        
        echo "Container Statistics"
        echo "-------------------"
        get_container_stats
        echo ""
        
        echo "Application Metrics"
        echo "------------------"
        get_app_metrics
        
    } > "$output_file"
    
    echo "Report exported to: $output_file"
}

# Handle Ctrl+C
trap 'MONITORING=false; echo -e "\n${YELLOW}Monitoring stopped${NC}"; exit 0' INT

# Main function
main() {
    case "${1:-monitor}" in
        monitor)
            monitor_display
            ;;
        export)
            export_metrics
            ;;
        health)
            show_header
            log_header "Quick Health Check"
            BACKEND_STATUS=$(check_service_status "Backend" "$BACKEND_URL/health")
            FRONTEND_STATUS=$(check_service_status "Frontend" "$FRONTEND_URL")
            log_status "Backend API" "$BACKEND_STATUS"
            log_status "Frontend" "$FRONTEND_STATUS"
            ;;
        *)
            echo "Usage: $0 [monitor|export|health]"
            echo ""
            echo "Commands:"
            echo "  monitor  - Real-time monitoring (default)"
            echo "  export   - Export metrics to file"
            echo "  health   - Quick health check"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"