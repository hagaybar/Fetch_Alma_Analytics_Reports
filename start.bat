@echo off
REM Alma Analytics Report Fetcher - Production Startup Script (Windows CMD)

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo === Alma Analytics Report Fetcher ===

REM Check for API key
if "%ALMA_PROD_API_KEY%"=="" (
    echo Error: ALMA_PROD_API_KEY environment variable is not set
    echo Set it with: set ALMA_PROD_API_KEY=your_api_key
    exit /b 1
)
echo API key configured

REM Check Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: python is not installed
    exit /b 1
)

REM Install backend dependencies if needed
if not exist "backend\.deps_installed" (
    echo Installing backend dependencies...
    pip install -r backend\requirements.txt --quiet
    type nul > backend\.deps_installed
)
echo Backend dependencies installed

REM Build frontend if needed
if not exist "frontend\dist" (
    echo Building frontend...

    where npm >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Error: npm is not installed. Install Node.js first.
        exit /b 1
    )

    cd frontend
    if not exist "node_modules" (
        call npm install --silent
    )
    call npm run build
    cd ..
)
echo Frontend built

REM Parse port argument
set PORT=8000
if not "%1"=="" set PORT=%1

echo.
echo Starting server on http://0.0.0.0:%PORT%
echo Press Ctrl+C to stop
echo.

cd backend
python -m uvicorn main:app --host 0.0.0.0 --port %PORT%
