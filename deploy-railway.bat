@echo off
echo Railway Deployment Script for Weather Dashboard

rem Check if the Railway CLI is installed
where railway >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Installing Railway CLI...
  npm install -g @railway/cli
) else (
  echo Railway CLI is already installed
)

rem Build the project
echo Building the project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed! Please fix the errors and try again.
  exit /b %ERRORLEVEL%
)

rem Login to Railway if not already logged in
railway whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Please log in to Railway:
  railway login
)

rem Link to the Railway project
echo Linking to Railway project...
railway link

rem Deploy the project
echo Deploying to Railway...
railway up

echo Deployment complete!
echo You can view your deployment status at: https://railway.app/dashboard
