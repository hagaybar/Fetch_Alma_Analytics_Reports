# Alma Analytics Report Fetcher - Production Startup Script (Windows PowerShell)

param(
    [string]$Host = "0.0.0.0",
    [int]$Port = 8000,
    [int]$Workers = 1,
    [switch]$Dev
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "=== Alma Analytics Report Fetcher ===" -ForegroundColor Green

# Check for API key
if (-not $env:ALMA_PROD_API_KEY) {
    Write-Host "Error: ALMA_PROD_API_KEY environment variable is not set" -ForegroundColor Red
    Write-Host 'Set it with: $env:ALMA_PROD_API_KEY = "your_api_key"'
    exit 1
}
Write-Host "✓ API key configured" -ForegroundColor Green

# Check Python
try {
    $null = Get-Command python -ErrorAction Stop
} catch {
    Write-Host "Error: python is not installed" -ForegroundColor Red
    exit 1
}

# Install backend dependencies if needed
if (-not (Test-Path "backend\.deps_installed")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    pip install -r backend\requirements.txt --quiet
    New-Item -Path "backend\.deps_installed" -ItemType File -Force | Out-Null
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Build frontend if needed
if (-not (Test-Path "frontend\dist")) {
    Write-Host "Building frontend..." -ForegroundColor Yellow

    try {
        $null = Get-Command npm -ErrorAction Stop
    } catch {
        Write-Host "Error: npm is not installed. Install Node.js first." -ForegroundColor Red
        exit 1
    }

    Push-Location frontend
    if (-not (Test-Path "node_modules")) {
        npm install --silent
    }
    npm run build
    Pop-Location
}
Write-Host "✓ Frontend built" -ForegroundColor Green

# Start server
Write-Host ""
Write-Host "Starting server on http://${Host}:${Port}" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop"
Write-Host ""

Set-Location backend

if ($Dev) {
    python -m uvicorn main:app --host $Host --port $Port --reload
} else {
    python -m uvicorn main:app --host $Host --port $Port --workers $Workers
}
