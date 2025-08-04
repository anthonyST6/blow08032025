# Simple VS Code Debug Setup Script
Write-Host "VS Code Debug Configuration Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Get paths
$projectRoot = Split-Path -Parent $PSScriptRoot
$vscodePath = Join-Path $projectRoot ".vscode"
$packagesPath = Join-Path $projectRoot "packages"

Write-Host "`nProject root: $projectRoot" -ForegroundColor Yellow

# Try to create .vscode directory
Write-Host "`nCreating .vscode directory..." -ForegroundColor Yellow

try {
    if (-not (Test-Path $vscodePath)) {
        New-Item -ItemType Directory -Path $vscodePath -Force | Out-Null
        Write-Host "Created .vscode directory successfully" -ForegroundColor Green
    } else {
        Write-Host ".vscode directory already exists" -ForegroundColor Green
    }
    
    # Copy launch.json
    $sourceLaunch = Join-Path $packagesPath "vscode-launch.json"
    $destLaunch = Join-Path $vscodePath "launch.json"
    
    if (Test-Path $sourceLaunch) {
        Copy-Item -Path $sourceLaunch -Destination $destLaunch -Force
        Write-Host "Copied launch.json successfully" -ForegroundColor Green
    }
    
    # Copy tasks.json
    $sourceTasks = Join-Path $packagesPath "vscode-tasks.json"
    $destTasks = Join-Path $vscodePath "tasks.json"
    
    if (Test-Path $sourceTasks) {
        Copy-Item -Path $sourceTasks -Destination $destTasks -Force
        Write-Host "Copied tasks.json successfully" -ForegroundColor Green
    }
    
    Write-Host "`nSetup completed!" -ForegroundColor Green
    Write-Host "`nTo use debugging:" -ForegroundColor Yellow
    Write-Host "1. Press F5 in VS Code" -ForegroundColor White
    Write-Host "2. Select 'Launch Chrome with Auto Start'" -ForegroundColor White
    Write-Host "3. Click the green play button" -ForegroundColor White
    
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "`nIf you see permission errors:" -ForegroundColor Yellow
    Write-Host "1. Run PowerShell as Administrator" -ForegroundColor White
    Write-Host "2. Navigate to: $packagesPath" -ForegroundColor White
    Write-Host "3. Run: .\setup-vscode-simple.ps1" -ForegroundColor White
    Write-Host "`nOr manually:" -ForegroundColor Yellow
    Write-Host "1. Create .vscode folder in project root" -ForegroundColor White
    Write-Host "2. Copy vscode-launch.json to .vscode\launch.json" -ForegroundColor White
    Write-Host "3. Copy vscode-tasks.json to .vscode\tasks.json" -ForegroundColor White
}

Write-Host "`nPress Enter to exit..."
Read-Host