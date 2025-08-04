@echo off
echo ========================================
echo Push Seraphim Vanguards to GitHub
echo ========================================
echo.
echo This script will help you push your project to GitHub.
echo Make sure you have:
echo 1. Installed Git (run setup-git.bat first)
echo 2. Created a new repository on GitHub
echo.
pause

echo.
echo Enter your GitHub repository details:
set /p username="Enter your GitHub username: "
set /p reponame="Enter your repository name (default: seraphim-vanguards): "

if "%reponame%"=="" set reponame=seraphim-vanguards

echo.
echo Adding GitHub remote...
git remote add origin https://github.com/%username%/%reponame%.git

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Push completed!
echo ========================================
echo.
echo Your repository is now available at:
echo https://github.com/%username%/%reponame%
echo.
echo Next steps:
echo 1. Add collaborators in GitHub settings
echo 2. Set up branch protection rules
echo 3. Configure GitHub Actions secrets for CI/CD
echo.
pause