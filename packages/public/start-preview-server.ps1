Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║           Starting Seraphim Vanguards Preview Server          ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Change to script directory
Set-Location -Path $PSScriptRoot

Write-Host "Checking if Node.js is installed..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Node.js $nodeVersion found" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Starting server on port 8080..." -ForegroundColor Green
Write-Host ""
Write-Host "Once started, you can access:" -ForegroundColor Cyan
Write-Host "  - Preview Pages: " -NoNewline
Write-Host "http://localhost:8080/preview/" -ForegroundColor Yellow
Write-Host "  - Platform Resources: " -NoNewline
Write-Host "http://localhost:8080/platform/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Magenta
Write-Host ""

# Start the server
node serve.js

# Keep window open if script fails
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Server exited with error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}