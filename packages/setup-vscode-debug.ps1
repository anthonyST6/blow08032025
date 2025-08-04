# Setup VS Code Debug Configuration Script
# This script will create the .vscode directory and move configuration files

Write-Host "VS Code Debug Configuration Setup Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Get the parent directory (project root)
$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`nProject root: $projectRoot" -ForegroundColor Yellow

# Function to create .vscode directory with elevated permissions
function Create-VsCodeDirectory {
    $vscodePath = Join-Path $projectRoot ".vscode"
    
    Write-Host "`nAttempting to create .vscode directory..." -ForegroundColor Yellow
    
    try {
        # Try to create directory normally first
        if (-not (Test-Path $vscodePath)) {
            New-Item -ItemType Directory -Path $vscodePath -Force | Out-Null
            Write-Host "✓ Created .vscode directory successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✓ .vscode directory already exists" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Failed to create .vscode directory: $_" -ForegroundColor Red
        
        # Try with elevated permissions
        Write-Host "`nTrying with elevated permissions..." -ForegroundColor Yellow
        
        $createDirScript = @"
try {
    New-Item -ItemType Directory -Path '$vscodePath' -Force | Out-Null
    Write-Host 'Successfully created .vscode directory with elevated permissions' -ForegroundColor Green
} catch {
    Write-Host "Failed to create directory even with elevated permissions: `$_" -ForegroundColor Red
    exit 1
}
"@
        
        Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $createDirScript -Verb RunAs -Wait
        
        # Check if directory was created
        if (Test-Path $vscodePath) {
            Write-Host "✓ Created .vscode directory with elevated permissions" -ForegroundColor Green
            return $true
        } else {
            return $false
        }
    }
}

# Function to copy configuration files
function Copy-ConfigFiles {
    $vscodePath = Join-Path $projectRoot ".vscode"
    $packagesPath = Join-Path $projectRoot "packages"
    
    Write-Host "`nCopying configuration files..." -ForegroundColor Yellow
    
    # Copy launch.json
    $sourceLaunch = Join-Path $packagesPath "vscode-launch.json"
    $destLaunch = Join-Path $vscodePath "launch.json"
    
    if (Test-Path $sourceLaunch) {
        try {
            Copy-Item -Path $sourceLaunch -Destination $destLaunch -Force
            Write-Host "✓ Copied launch.json successfully" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to copy launch.json: $_" -ForegroundColor Red
            
            # Try with elevated permissions
            Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "Copy-Item -Path '$sourceLaunch' -Destination '$destLaunch' -Force" -Verb RunAs -Wait
            
            if (Test-Path $destLaunch) {
                Write-Host "✓ Copied launch.json with elevated permissions" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✗ Source launch.json not found at: $sourceLaunch" -ForegroundColor Red
    }
    
    # Copy tasks.json
    $sourceTasks = Join-Path $packagesPath "vscode-tasks.json"
    $destTasks = Join-Path $vscodePath "tasks.json"
    
    if (Test-Path $sourceTasks) {
        try {
            Copy-Item -Path $sourceTasks -Destination $destTasks -Force
            Write-Host "✓ Copied tasks.json successfully" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to copy tasks.json: $_" -ForegroundColor Red
            
            # Try with elevated permissions
            Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "Copy-Item -Path '$sourceTasks' -Destination '$destTasks' -Force" -Verb RunAs -Wait
            
            if (Test-Path $destTasks) {
                Write-Host "✓ Copied tasks.json with elevated permissions" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✗ Source tasks.json not found at: $sourceTasks" -ForegroundColor Red
    }
}

# Main execution
Write-Host "`nStarting VS Code debug configuration setup..." -ForegroundColor Cyan

# Step 1: Create .vscode directory
if (Create-VsCodeDirectory) {
    # Step 2: Copy configuration files
    Copy-ConfigFiles
    
    Write-Host "`n=======================================" -ForegroundColor Cyan
    Write-Host "Setup completed!" -ForegroundColor Green
    Write-Host "`nTo use the debug configuration:" -ForegroundColor Yellow
    Write-Host "1. Open VS Code in the project root directory" -ForegroundColor White
    Write-Host "2. Press F5 or go to Run and Debug (Ctrl+Shift+D)" -ForegroundColor White
    Write-Host "3. Select 'Launch Chrome with Auto Start' from the dropdown" -ForegroundColor White
    Write-Host "4. Click the green play button to start debugging" -ForegroundColor White
    Write-Host "`nThe configuration will automatically:" -ForegroundColor Yellow
    Write-Host "- Start the development server (npm run dev)" -ForegroundColor White
    Write-Host "- Launch Chrome browser" -ForegroundColor White
    Write-Host "- Connect the debugger with source maps" -ForegroundColor White
    Write-Host "- Stop the server when debugging ends" -ForegroundColor White
} else {
    Write-Host "`n=======================================" -ForegroundColor Cyan
    Write-Host "Setup failed!" -ForegroundColor Red
    Write-Host "`nManual setup instructions:" -ForegroundColor Yellow
    Write-Host "1. Close VS Code completely" -ForegroundColor White
    Write-Host "2. Right-click VS Code and select 'Run as administrator'" -ForegroundColor White
    Write-Host "3. Open your project" -ForegroundColor White
    Write-Host "4. Create a new folder named '.vscode' in the project root" -ForegroundColor White
    Write-Host "5. Copy the files from packages/vscode-*.json to .vscode/" -ForegroundColor White
    Write-Host "   - Rename vscode-launch.json to launch.json" -ForegroundColor White
    Write-Host "   - Rename vscode-tasks.json to tasks.json" -ForegroundColor White
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")