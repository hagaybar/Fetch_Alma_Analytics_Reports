#!/bin/bash
# Alma Analytics Report Fetcher - Production Startup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Alma Analytics Report Fetcher ===${NC}"

# Check for API key
if [ -z "$ALMA_PROD_API_KEY" ]; then
    echo -e "${RED}Error: ALMA_PROD_API_KEY environment variable is not set${NC}"
    echo "Set it with: export ALMA_PROD_API_KEY=your_api_key"
    exit 1
fi
echo -e "${GREEN}✓ API key configured${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/__pycache__" ] || [ ! -f "backend/.deps_installed" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip3 install -r backend/requirements.txt --quiet
    touch backend/.deps_installed
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Build frontend if needed
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}Building frontend...${NC}"

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed. Install Node.js first.${NC}"
        exit 1
    fi

    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install --silent
    fi
    npm run build
    cd ..
fi
echo -e "${GREEN}✓ Frontend built${NC}"

# Parse arguments
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
WORKERS="${WORKERS:-1}"

while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        --workers)
            WORKERS="$2"
            shift 2
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Start server
echo ""
echo -e "${GREEN}Starting server on http://${HOST}:${PORT}${NC}"
echo "Press Ctrl+C to stop"
echo ""

cd backend

if [ "$DEV_MODE" = true ]; then
    python3 -m uvicorn main:app --host "$HOST" --port "$PORT" --reload
else
    python3 -m uvicorn main:app --host "$HOST" --port "$PORT" --workers "$WORKERS"
fi
