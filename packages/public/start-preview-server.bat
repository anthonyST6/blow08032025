@echo off
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           Starting Seraphim Vanguards Preview Server          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting server on port 8080...
echo.
echo Once started, you can access:
echo   - Preview Pages: http://localhost:8080/preview/
echo   - Platform Resources: http://localhost:8080/platform/
echo.
echo Press Ctrl+C to stop the server
echo.

node serve.js

pause