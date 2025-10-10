@echo off
REM Deploy site script for Windows
REM Copies vault content, deploys to Fly.io, commits and pushes changes

setlocal enabledelayedexpansion

echo ==========================================
echo 🚀 Starting site deployment
echo ==========================================

REM Get project root
cd /d "%~dp0.."

REM Step 1: Copy vault content to site
echo.
echo 📁 Step 1: Copying vault content to site...
echo    Source: apps\vault\
echo    Destination: apps\site\content\

REM Remove old content
if exist "apps\site\content" (
    echo    Cleaning destination...
    for /d %%D in (apps\site\content\*) do rd /s /q "%%D"
    del /q apps\site\content\*.* 2>nul
)

REM Create destination if it doesn't exist
if not exist "apps\site\content" mkdir apps\site\content

REM Copy all vault content (excluding .obsidian metadata)
echo    Copying files...
robocopy apps\vault apps\site\content /E /XD apps\vault\.obsidian /NFL /NDL /NJH /NJS > nul
if errorlevel 8 (
    echo    ❌ Copy failed!
    exit /b 1
)

echo    ✅ Content copied successfully

REM Show what was copied
echo.
echo    Copied:
dir /B apps\site\content

REM Step 2: Deploy to Fly.io
echo.
echo 🛫 Step 2: Deploying to Fly.io...
echo    Config: infra\fly\site\fly.toml

flyctl deploy --config infra\fly\site\fly.toml

if errorlevel 1 (
    echo    ❌ Deployment failed!
    exit /b 1
)

echo    ✅ Deployment completed

REM Step 3: Commit and push all changes
echo.
echo 📝 Step 3: Committing and pushing changes...

REM Check if there are any changes
git status --porcelain > nul 2>&1
if errorlevel 1 (
    echo    No changes to commit
) else (
    echo    Staging all changes...
    git add .

    echo    Creating commit...
    for /f "tokens=*" %%a in ('powershell -command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set TIMESTAMP=%%a

    git commit -m "Deploy site: sync vault content and deploy" -m "" -m "- Synced vault content to site/content" -m "- Deployed to Fly.io" -m "- Automated deployment at !TIMESTAMP!" -m "" -m "🤖 Generated with bashscripts/deploy-site.bat"

    echo    Pushing to remote...
    git push

    if errorlevel 1 (
        echo    ❌ Push failed!
        exit /b 1
    )

    echo    ✅ Changes committed and pushed
)

echo.
echo ==========================================
echo ✨ Deployment complete!
echo ==========================================
echo.
echo Summary:
echo   📁 Content synced: apps\vault\ → apps\site\content\
echo   🛫 Deployed to Fly.io
echo   📝 Changes committed and pushed to git
echo.

pause
