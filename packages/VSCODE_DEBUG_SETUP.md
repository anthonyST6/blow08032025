# VS Code Debug Configuration Setup

Due to permission issues in the root directory, the VS Code configuration files have been created in the `packages` directory. Follow these steps to set up Chrome debugging with auto-launch.

## Files Created

1. **vscode-launch.json** - Debug configurations for Chrome and Node.js
2. **vscode-tasks.json** - Tasks for automatically starting/stopping the dev server
3. **setup-vscode-debug.ps1** - PowerShell script to automate the setup

## Setup Instructions

### Option 1: Automated Setup (Recommended)

1. Open PowerShell as Administrator
2. Navigate to the packages directory:
   ```powershell
   cd "C:\Users\antho\Seraphim Vanguards Kilo Dev\packages"
   ```
3. Run the setup script:
   ```powershell
   .\setup-vscode-debug.ps1
   ```

### Option 2: Manual Setup

1. **Close VS Code completely**

2. **Create .vscode directory manually:**
   - Open File Explorer
   - Navigate to `C:\Users\antho\Seraphim Vanguards Kilo Dev`
   - Right-click in the folder
   - Select "New" > "Folder"
   - Name it `.vscode` (include the dot)

3. **Copy configuration files:**
   - Copy `packages/vscode-launch.json` to `.vscode/launch.json`
   - Copy `packages/vscode-tasks.json` to `.vscode/tasks.json`

### Option 3: If permissions still fail

1. **Run VS Code as Administrator:**
   - Right-click VS Code shortcut
   - Select "Run as administrator"
   - Open your project
   - Try pressing F5 to debug (VS Code should create .vscode automatically)

2. **Alternative location:**
   If you still can't create .vscode in the root, you can:
   - Create `.vscode` folder inside `packages/frontend/`
   - Copy the configuration files there
   - Adjust the paths in launch.json by removing `/packages/frontend` from webRoot

## Debug Configurations Available

### 1. Launch Chrome with Auto Start
- Automatically starts the dev server (`npm run dev`)
- Launches Chrome browser
- Connects debugger with source maps
- Stops the server when debugging ends

### 2. Launch Chrome (Server Already Running)
- Use this if you already have the dev server running
- Just launches Chrome and connects the debugger

### 3. Debug Backend
- Debugs the Node.js backend server
- Compiles TypeScript before debugging

### 4. Full Stack Debug with Auto Start
- Runs both backend and frontend debugging simultaneously

## How to Use

1. **Start debugging:**
   - Press `F5` or go to Run and Debug panel (`Ctrl+Shift+D`)
   - Select "Launch Chrome with Auto Start" from the dropdown
   - Click the green play button

2. **Set breakpoints:**
   - Click in the gutter next to line numbers in your `.ts` or `.tsx` files
   - The debugger will pause at these points

3. **Debug features:**
   - Step through code line by line
   - Inspect variables
   - View call stack
   - Use debug console

## Troubleshooting

### Permission Errors
- Run VS Code as Administrator
- Check antivirus software isn't blocking file creation
- Ensure Windows Defender isn't blocking VS Code

### Chrome Not Launching
- Ensure Chrome is installed
- Check if Chrome is in your system PATH
- Try using Edge: change `"type": "chrome"` to `"type": "edge"` in launch.json

### Source Maps Not Working
- Ensure `vite.config.ts` has `build.sourcemap: true`
- Clear browser cache
- Check the sourceMapPathOverrides in launch.json

### Dev Server Not Starting
- Check if port 3000 is already in use
- Ensure `npm install` has been run in both frontend and backend
- Check the tasks.json problemMatcher pattern

## Configuration Details

The configuration includes:
- Vite path aliases support (`/@/*` → `src/*`)
- Automatic dev server management
- Source map support for TypeScript debugging
- Separate Chrome profile to avoid conflicts
- Backend TypeScript compilation before debugging