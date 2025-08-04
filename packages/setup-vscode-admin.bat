@echo off
echo VS Code Debug Configuration Setup (Administrator)
echo =================================================
echo.

:: Get the parent directory (project root)
set "PROJECT_ROOT=%~dp0.."
set "VSCODE_PATH=%PROJECT_ROOT%\.vscode"
set "PACKAGES_PATH=%PROJECT_ROOT%\packages"

echo Project root: %PROJECT_ROOT%
echo.

:: Create .vscode directory
echo Creating .vscode directory...
if not exist "%VSCODE_PATH%" (
    mkdir "%VSCODE_PATH%"
    if %errorlevel% equ 0 (
        echo [SUCCESS] Created .vscode directory
    ) else (
        echo [ERROR] Failed to create .vscode directory
        echo Please run this script as Administrator
        goto :manual
    )
) else (
    echo [INFO] .vscode directory already exists
)

:: Copy launch.json
echo.
echo Copying launch.json...
if exist "%PACKAGES_PATH%\vscode-launch.json" (
    copy /Y "%PACKAGES_PATH%\vscode-launch.json" "%VSCODE_PATH%\launch.json" >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] Copied launch.json
    ) else (
        echo [ERROR] Failed to copy launch.json
    )
) else (
    echo [ERROR] Source file vscode-launch.json not found
)

:: Copy tasks.json
echo.
echo Copying tasks.json...
if exist "%PACKAGES_PATH%\vscode-tasks.json" (
    copy /Y "%PACKAGES_PATH%\vscode-tasks.json" "%VSCODE_PATH%\tasks.json" >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] Copied tasks.json
    ) else (
        echo [ERROR] Failed to copy tasks.json
    )
) else (
    echo [ERROR] Source file vscode-tasks.json not found
)

echo.
echo =================================================
echo Setup completed!
echo.
echo To use debugging in VS Code:
echo 1. Press F5 or go to Run and Debug (Ctrl+Shift+D)
echo 2. Select "Launch Chrome with Auto Start"
echo 3. Click the green play button
echo.
echo The configuration will automatically:
echo - Start the development server (npm run dev)
echo - Launch Chrome browser
echo - Connect debugger with source maps
echo - Stop the server when debugging ends
goto :end

:manual
echo.
echo =================================================
echo Manual Setup Instructions:
echo.
echo 1. Right-click this file and select "Run as administrator"
echo.
echo OR manually:
echo.
echo 1. Create folder: %VSCODE_PATH%
echo 2. Copy %PACKAGES_PATH%\vscode-launch.json
echo    to %VSCODE_PATH%\launch.json
echo 3. Copy %PACKAGES_PATH%\vscode-tasks.json
echo    to %VSCODE_PATH%\tasks.json

:end
echo.
pause