# Seraphim Vanguards Public Directory

This directory contains public resources for the Seraphim Vanguards project.

## Structure

- **preview/**: Contains HTML preview files for all application pages
- **platform/**: Contains platform-related resources and links
- **serve.js**: HTTP server for serving static files
- **start-preview-server.bat**: Windows batch script to start the server
- **start-preview-server.ps1**: PowerShell script to start the server

## Quick Start

### Windows Users

#### Option 1: Using Batch Script
Double-click `start-preview-server.bat` or run:
```bash
start-preview-server.bat
```

#### Option 2: Using PowerShell
Right-click `start-preview-server.ps1` and select "Run with PowerShell" or run:
```powershell
.\start-preview-server.ps1
```

#### Option 3: Using Node.js directly
```bash
node serve.js
```

### Access Points

Once the server is running, you can access:
- **Preview Pages**: http://localhost:8080/preview/
- **Platform Resources**: http://localhost:8080/platform/

## Preview Pages

The preview directory contains static HTML representations of all the application pages for demonstration and documentation purposes. This includes:
- Authentication pages (login, register, etc.)
- Various dashboards (admin, compliance, risk officer)
- Agent management interfaces
- Workflow builders
- Analytics and reporting pages

## Platform Resources

The platform directory contains:
- Links to different environments (development, staging, production)
- Documentation references
- Development tools and commands
- Deployment resources
- Quick access to common tasks

## Server Configuration

The server runs on port 8080 by default. You can change this by setting the PORT environment variable:
```bash
PORT=3001 node serve.js
```