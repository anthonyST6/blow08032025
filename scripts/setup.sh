#!/bin/bash

# Seraphim Vanguard Platform - Initial Setup Script
# This script helps set up the development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check system requirements
check_system() {
    log_info "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    log_info "Detected OS: $OS"
}

# Install Node.js if not present
install_nodejs() {
    if ! command -v node &> /dev/null; then
        log_warn "Node.js is not installed"
        log_prompt "Would you like to install Node.js? (y/n)"
        read -r response
        
        if [[ "$response" == "y" ]]; then
            case $OS in
                "linux")
                    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    ;;
                "macos")
                    if command -v brew &> /dev/null; then
                        brew install node
                    else
                        log_error "Please install Homebrew first: https://brew.sh"
                        exit 1
                    fi
                    ;;
                "windows")
                    log_info "Please download and install Node.js from: https://nodejs.org/"
                    log_info "After installation, run this script again"
                    exit 0
                    ;;
            esac
        else
            log_error "Node.js is required to continue"
            exit 1
        fi
    fi
    
    NODE_VERSION=$(node -v)
    log_info "Node.js version: $NODE_VERSION"
}

# Install Docker if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        log_warn "Docker is not installed"
        log_prompt "Would you like instructions for installing Docker? (y/n)"
        read -r response
        
        if [[ "$response" == "y" ]]; then
            case $OS in
                "linux")
                    log_info "Install Docker using:"
                    echo "curl -fsSL https://get.docker.com | sh"
                    echo "sudo usermod -aG docker $USER"
                    ;;
                "macos"|"windows")
                    log_info "Download Docker Desktop from: https://www.docker.com/products/docker-desktop"
                    ;;
            esac
            log_info "After installing Docker, run this script again"
            exit 0
        fi
    else
        log_info "Docker is installed"
    fi
}

# Create environment files
setup_env_files() {
    log_info "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "packages/backend/.env" ]; then
        cp packages/backend/.env.example packages/backend/.env
        log_info "Created packages/backend/.env - Please configure it with your values"
    else
        log_info "Backend .env already exists"
    fi
    
    # Frontend .env
    if [ ! -f "packages/frontend/.env" ]; then
        cp packages/frontend/.env.example packages/frontend/.env
        log_info "Created packages/frontend/.env - Please configure it with your values"
    else
        log_info "Frontend .env already exists"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd packages/backend
    npm install
    cd ../..
    
    # Install frontend dependencies
    cd packages/frontend
    npm install
    cd ../..
    
    log_info "Dependencies installed successfully"
}

# Setup Firebase
setup_firebase() {
    log_info "Firebase Setup Instructions:"
    echo ""
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Create a new project or select an existing one"
    echo "3. Enable Authentication (Email/Password)"
    echo "4. Enable Firestore Database"
    echo "5. Create a service account:"
    echo "   - Go to Project Settings > Service Accounts"
    echo "   - Click 'Generate new private key'"
    echo "   - Save the JSON file securely"
    echo "6. Update the backend .env file with:"
    echo "   - FIREBASE_PROJECT_ID"
    echo "   - FIREBASE_PRIVATE_KEY (from the JSON file)"
    echo "   - FIREBASE_CLIENT_EMAIL (from the JSON file)"
    echo "7. Update the frontend .env file with:"
    echo "   - Web app configuration from Project Settings > General"
    echo ""
    log_prompt "Press Enter when you've completed the Firebase setup..."
    read -r
}

# Setup SSL certificates for local development
setup_ssl() {
    log_info "Setting up SSL certificates for local development..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
        
        # Generate self-signed certificate
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        log_info "Self-signed SSL certificate created in ssl/"
    else
        log_info "SSL directory already exists"
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    directories=(
        "logs"
        "backups"
        "ssl"
        "monitoring/alerts"
        "monitoring/grafana/dashboards"
        "monitoring/grafana/datasources"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
    done
    
    log_info "Directories created"
}

# Run initial build
run_build() {
    log_prompt "Would you like to build the project now? (y/n)"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        log_info "Building backend..."
        cd packages/backend
        npm run build
        cd ../..
        
        log_info "Building frontend..."
        cd packages/frontend
        npm run build
        cd ../..
        
        log_info "Build completed"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    log_info "Setup completed! Next steps:"
    echo ""
    echo "1. Configure environment variables:"
    echo "   - Edit packages/backend/.env"
    echo "   - Edit packages/frontend/.env"
    echo ""
    echo "2. Start development servers:"
    echo "   npm run dev"
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend API: http://localhost:3001"
    echo "   - API Documentation: http://localhost:3001/api-docs"
    echo ""
    echo "4. Run tests:"
    echo "   npm test"
    echo ""
    echo "5. Deploy to production:"
    echo "   ./scripts/deploy.sh production"
    echo ""
    log_info "Happy coding! 🚀"
}

# Main setup flow
main() {
    log_info "Welcome to Seraphim Vanguard Platform Setup"
    echo ""
    
    check_system
    install_nodejs
    install_docker
    create_directories
    setup_env_files
    install_dependencies
    setup_firebase
    setup_ssl
    run_build
    show_next_steps
}

# Run main function
main