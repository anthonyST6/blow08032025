#!/bin/bash

# Seraphim Vanguard Platform - Deployment Checklist
# This script validates that all deployment requirements are met

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Checklist status
CHECKLIST_PASSED=true

# Functions
check_pass() {
    echo -e "${GREEN}[✓]${NC} $1"
}

check_fail() {
    echo -e "${RED}[✗]${NC} $1"
    CHECKLIST_PASSED=false
}

check_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

check_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

section_header() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    section_header "Prerequisites"
    
    # Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            check_pass "Node.js v18+ installed ($(node -v))"
        else
            check_fail "Node.js version must be 18 or higher (found $(node -v))"
        fi
    else
        check_fail "Node.js is not installed"
    fi
    
    # npm version
    if command -v npm &> /dev/null; then
        check_pass "npm installed ($(npm -v))"
    else
        check_fail "npm is not installed"
    fi
    
    # Docker
    if command -v docker &> /dev/null; then
        check_pass "Docker installed ($(docker --version))"
    else
        check_fail "Docker is not installed"
    fi
    
    # Docker Compose
    if command -v docker-compose &> /dev/null; then
        check_pass "Docker Compose installed ($(docker-compose --version))"
    else
        check_fail "Docker Compose is not installed"
    fi
    
    # Git
    if command -v git &> /dev/null; then
        check_pass "Git installed ($(git --version))"
    else
        check_fail "Git is not installed"
    fi
}

# Check environment files
check_environment() {
    section_header "Environment Configuration"
    
    # Backend .env
    if [ -f "packages/backend/.env" ]; then
        check_pass "Backend .env file exists"
        
        # Check required variables
        REQUIRED_VARS=(
            "FIREBASE_PROJECT_ID"
            "FIREBASE_PRIVATE_KEY"
            "FIREBASE_CLIENT_EMAIL"
            "OPENAI_API_KEY"
            "JWT_SECRET"
        )
        
        for var in "${REQUIRED_VARS[@]}"; do
            if grep -q "^$var=" packages/backend/.env; then
                check_pass "Backend: $var is configured"
            else
                check_fail "Backend: $var is missing"
            fi
        done
    else
        check_fail "Backend .env file not found"
        check_info "Copy packages/backend/.env.example to packages/backend/.env"
    fi
    
    # Frontend .env
    if [ -f "packages/frontend/.env" ]; then
        check_pass "Frontend .env file exists"
        
        # Check required variables
        REQUIRED_VARS=(
            "VITE_FIREBASE_API_KEY"
            "VITE_FIREBASE_AUTH_DOMAIN"
            "VITE_FIREBASE_PROJECT_ID"
            "VITE_API_URL"
        )
        
        for var in "${REQUIRED_VARS[@]}"; do
            if grep -q "^$var=" packages/frontend/.env; then
                check_pass "Frontend: $var is configured"
            else
                check_fail "Frontend: $var is missing"
            fi
        done
    else
        check_fail "Frontend .env file not found"
        check_info "Copy packages/frontend/.env.example to packages/frontend/.env"
    fi
}

# Check Docker configuration
check_docker_config() {
    section_header "Docker Configuration"
    
    # Docker Compose files
    if [ -f "docker-compose.yml" ]; then
        check_pass "docker-compose.yml exists"
    else
        check_fail "docker-compose.yml not found"
    fi
    
    if [ -f "docker-compose.prod.yml" ]; then
        check_pass "docker-compose.prod.yml exists"
    else
        check_fail "docker-compose.prod.yml not found"
    fi
    
    # Dockerfiles
    if [ -f "packages/backend/Dockerfile" ]; then
        check_pass "Backend Dockerfile exists"
    else
        check_fail "Backend Dockerfile not found"
    fi
    
    if [ -f "packages/frontend/Dockerfile" ]; then
        check_pass "Frontend Dockerfile exists"
    else
        check_fail "Frontend Dockerfile not found"
    fi
    
    # nginx config
    if [ -f "packages/frontend/nginx.conf" ]; then
        check_pass "Frontend nginx.conf exists"
    else
        check_fail "Frontend nginx.conf not found"
    fi
}

# Check deployment scripts
check_deployment_scripts() {
    section_header "Deployment Scripts"
    
    SCRIPTS=(
        "scripts/deploy.sh"
        "scripts/setup.sh"
        "scripts/health-check.sh"
        "scripts/rollback.sh"
        "scripts/monitor.sh"
    )
    
    for script in "${SCRIPTS[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                check_pass "$script exists and is executable"
            else
                check_warn "$script exists but is not executable"
                check_info "Run: chmod +x $script"
            fi
        else
            check_fail "$script not found"
        fi
    done
}

# Check SSL certificates
check_ssl() {
    section_header "SSL/TLS Configuration"
    
    if [ -d "ssl" ]; then
        if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
            check_pass "SSL certificates found"
            
            # Check certificate validity
            if command -v openssl &> /dev/null; then
                CERT_EXPIRY=$(openssl x509 -enddate -noout -in ssl/cert.pem 2>/dev/null | cut -d= -f2)
                if [ -n "$CERT_EXPIRY" ]; then
                    check_info "Certificate expires: $CERT_EXPIRY"
                fi
            fi
        else
            check_warn "SSL certificates not found in ssl/ directory"
            check_info "For production, obtain valid SSL certificates"
        fi
    else
        check_warn "SSL directory not found"
        check_info "Create ssl/ directory and add certificates for HTTPS"
    fi
}

# Check monitoring setup
check_monitoring() {
    section_header "Monitoring Configuration"
    
    # Prometheus config
    if [ -f "monitoring/prometheus.yml" ]; then
        check_pass "Prometheus configuration exists"
    else
        check_warn "Prometheus configuration not found"
    fi
    
    # Grafana dashboards
    if [ -d "monitoring/grafana/dashboards" ]; then
        check_pass "Grafana dashboards directory exists"
    else
        check_warn "Grafana dashboards directory not found"
    fi
    
    # Alerts
    if [ -f "monitoring/alerts/alerts.yml" ]; then
        check_pass "Alert rules configured"
    else
        check_warn "Alert rules not configured"
    fi
}

# Check build artifacts
check_build() {
    section_header "Build Artifacts"
    
    # Backend build
    if [ -d "packages/backend/dist" ]; then
        check_pass "Backend build directory exists"
    else
        check_warn "Backend not built"
        check_info "Run: cd packages/backend && npm run build"
    fi
    
    # Frontend build
    if [ -d "packages/frontend/dist" ]; then
        check_pass "Frontend build directory exists"
    else
        check_warn "Frontend not built"
        check_info "Run: cd packages/frontend && npm run build"
    fi
}

# Check security
check_security() {
    section_header "Security Checklist"
    
    # Check for default secrets
    if [ -f "packages/backend/.env" ]; then
        if grep -q "your-jwt-secret" packages/backend/.env; then
            check_fail "Default JWT secret detected - change before deployment!"
        else
            check_pass "JWT secret appears to be customized"
        fi
    fi
    
    # Check CORS configuration
    if [ -f "packages/backend/.env" ]; then
        if grep -q "CORS_ORIGIN=" packages/backend/.env; then
            check_pass "CORS origin is configured"
        else
            check_warn "CORS origin not configured"
        fi
    fi
    
    # Check for .env in git
    if git ls-files --error-unmatch packages/backend/.env &> /dev/null; then
        check_fail ".env file is tracked in git - remove it!"
    else
        check_pass ".env files are not tracked in git"
    fi
}

# Generate deployment report
generate_report() {
    section_header "Deployment Readiness Report"
    
    if $CHECKLIST_PASSED; then
        echo -e "${GREEN}✓ All deployment checks passed!${NC}"
        echo "The platform is ready for deployment."
    else
        echo -e "${RED}✗ Some deployment checks failed.${NC}"
        echo "Please address the issues above before deploying."
    fi
    
    echo ""
    echo "Next steps:"
    if $CHECKLIST_PASSED; then
        echo "1. Run: ./scripts/deploy.sh production"
        echo "2. Monitor deployment: ./scripts/monitor.sh"
        echo "3. Run health check: ./scripts/health-check.sh"
    else
        echo "1. Fix the failed checks above"
        echo "2. Run this checklist again"
        echo "3. Once all checks pass, proceed with deployment"
    fi
}

# Main checklist flow
main() {
    echo "Seraphim Vanguard Platform - Deployment Checklist"
    echo "================================================="
    
    check_prerequisites
    check_environment
    check_docker_config
    check_deployment_scripts
    check_ssl
    check_monitoring
    check_build
    check_security
    
    generate_report
    
    # Exit with appropriate code
    if $CHECKLIST_PASSED; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main