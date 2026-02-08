# Alma Analytics Report Fetcher

## Project Overview

A Python/React application that automates downloading reports from Alma Analytics (ExLibris) via their API. Features a web UI for task management and a REST API backend.

## Quick Start

```bash
# Set API key
export ALMA_PROD_API_KEY=your_key

# Start backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Start frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

## Project Structure

```
backend/
├── main.py                    # FastAPI entry point
├── api/routes/                # REST endpoints (tasks, reports, logs)
├── core/
│   ├── alma_fetcher.py        # Report fetching logic
│   ├── config_manager.py      # JSON config CRUD
│   └── job_manager.py         # Background job tracking
└── models/                    # Pydantic models

frontend/
├── src/
│   ├── api/client.ts          # Axios API client
│   ├── components/            # React components
│   ├── hooks/                 # useTasks, useJobs, useLogs
│   └── pages/                 # Dashboard, TasksPage, LogsPage

legacy/                        # Original CLI script
reports_config.json            # Task configurations
```

## Tech Stack

**Backend**: Python 3.8+, FastAPI, Pydantic, uvicorn
**Frontend**: React 18, TypeScript, Vite, Tailwind CSS
**API Client**: axios
**No auth** (local use only)

## Key Files

- `backend/core/alma_fetcher.py` - Core report fetching logic
- `backend/core/config_manager.py` - Manages reports_config.json
- `frontend/src/api/client.ts` - API client with typed endpoints
- `frontend/src/hooks/useJobs.ts` - Job polling with auto-refresh

## API Endpoints

```
GET    /api/v1/tasks           # List tasks
POST   /api/v1/tasks           # Create task
PUT    /api/v1/tasks/{name}    # Update task
DELETE /api/v1/tasks/{name}    # Delete task
POST   /api/v1/reports/run     # Run report (returns job_id)
GET    /api/v1/reports/jobs    # List jobs
GET    /api/v1/reports/jobs/{id}  # Get job status
GET    /api/v1/logs/{task}     # List log files
```

## Code Conventions

**Backend**:
- Standard library imports first, then third-party
- Functions use snake_case
- Pydantic models for request/response validation

**Frontend**:
- TypeScript strict mode
- Custom hooks for data fetching
- Tailwind CSS with CSS variables for theming

## Development

```bash
# Type check frontend
cd frontend && npx tsc --noEmit

# Backend with auto-reload
cd backend && uvicorn main:app --reload

# Frontend dev server
cd frontend && npm run dev
```

## Known Limitations

- No support for reports with input prompts
- No authentication refresh mechanism
- Hardcoded to EU API endpoint
- Jobs stored in-memory (lost on restart)
