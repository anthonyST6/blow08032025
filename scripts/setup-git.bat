@echo off
echo ========================================
echo Git Setup for Seraphim Vanguards Project
echo ========================================
echo.

echo Step 1: Download Git for Windows
echo Please download Git from: https://git-scm.com/download/win
echo.
echo After downloading, run the installer with default settings.
echo.
pause

echo.
echo Step 2: Verify Git Installation
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not installed or not in PATH.
    echo Please install Git and restart this script.
    pause
    exit /b 1
)

echo Git is installed successfully!
git --version
echo.

echo Step 3: Configure Git with your information
set /p username="Enter your GitHub username: "
set /p email="Enter your GitHub email: "

git config --global user.name "%username%"
git config --global user.email "%email%"

echo.
echo Git configuration completed!
echo User: %username%
echo Email: %email%
echo.

echo Step 4: Initialize Git repository
cd /d "%~dp0.."
git init

echo.
echo Step 5: Add all files to Git
git add .

echo.
echo Step 6: Create initial commit
git commit -m "Initial commit: Seraphim Vanguards AI Governance Platform"

echo.
echo ========================================
echo Git repository initialized successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub (https://github.com/new)
echo 2. Name it: seraphim-vanguards
echo 3. Don't initialize with README, .gitignore, or license
echo 4. After creating, GitHub will show you commands to push
echo 5. Run the push commands in this directory
echo.
echo Example commands (replace USERNAME with your GitHub username):
echo   git remote add origin https://github.com/USERNAME/seraphim-vanguards.git
echo   git branch -M main
echo   git push -u origin main
echo.
pause