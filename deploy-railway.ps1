Write-Host "Railway Deployment Script for Weather Dashboard" -ForegroundColor Cyan

# Check if the Railway CLI is installed
$railwayInstalled = $null
try {
    $railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
} catch {}

if (-not $railwayInstalled) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
} else {
    Write-Host "Railway CLI is already installed" -ForegroundColor Green
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please fix the errors and try again." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Check if logged in to Railway
$loggedIn = $false
try {
    $output = railway whoami 2>&1
    if ($output -match "Logged in") {
        $loggedIn = $true
    }
} catch {}

if (-not $loggedIn) {
    Write-Host "Please log in to Railway:" -ForegroundColor Yellow
    railway login
}

# Link to the Railway project
Write-Host "Linking to Railway project..." -ForegroundColor Cyan
railway link

# Check if the WEATHERAPI_KEY is set as an environment variable on Railway
Write-Host "Checking for WEATHERAPI_KEY environment variable..." -ForegroundColor Cyan
$checkEnv = railway variables get WEATHERAPI_KEY 2>&1
if ($checkEnv -match "not found") {
    $apiKey = Read-Host "Enter your WeatherAPI key"
    if ($apiKey) {
        railway variables set WEATHERAPI_KEY=$apiKey
        Write-Host "WEATHERAPI_KEY has been set" -ForegroundColor Green
    } else {
        Write-Host "No API key provided. Your app may not work correctly!" -ForegroundColor Red
    }
} else {
    Write-Host "WEATHERAPI_KEY is already set" -ForegroundColor Green
}

# Deploy the project
Write-Host "Deploying to Railway..." -ForegroundColor Cyan
railway up

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "You can view your deployment status at: https://railway.app/dashboard" -ForegroundColor Cyan
