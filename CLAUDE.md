# Alma Analytics Report Fetcher

## Babysitter Skill Usage
When a task is "complicated," use the `babysitter` skill (`/babysitter:call`) to orchestrate the workflow instead of executing it directly.

### Criteria for "Complicated"
A task is complicated if it meets any of the following:
- **Decomposition:** The request requires breaking down into multiple sub-tasks or stages (e.g., "Add a CLI interface," "Refactor the authentication module," "Implement a new feature with tests").
- **Quality Control:** The task needs verification steps, testing, or iterative refinement to ensure correctness.
- **State Management:** The process would benefit from being resumable or needs a deterministic audit trail of steps taken.

### Decision Logic
- **Direct Execution:** For simple, atomic, or single-activity tasks (e.g., "Summarize this," "Fix this typo," "Explain this function").
- **Babysitter (/babysitter:call):** For multi-step engineering tasks that involve analysis, implementation, and testing.

### Execution Style
When using babysitter, lean into its "Quality Convergence" strength: define clear sub-tasks, set quality targets, and utilize breakpoints for human-in-the-loop approval when moving between major phases of the task.


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

## Task Configuration

Each task in `reports_config.json` has the following fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ALMA_REPORT_PATH` | string | Yes | - | URL-encoded path to the Alma Analytics report |
| `OUTPUT_PATH` | string | Yes | - | Directory where output files are saved |
| `OUTPUT_FILE_NAME` | string | Yes | - | Name of the output file |
| `OUTPUT_FORMAT` | string | Yes | `xlsx` | Output format: `xlsx`, `csv`, or `tsv` |
| `LOG_DIR` | string | Yes | - | Directory for log files |
| `TEST_OUTPUT_PATH` | string | No | - | Output directory for test mode |
| `TEST_LOG_DIR` | string | No | - | Log directory for test mode |
| `TEST_ROW_LIMIT` | int | No | `25` | Max rows to fetch in test mode |
| `FREQUENCY` | string | No | `daily` | Scheduling frequency: `daily` or `weekly` |
| `ACTIVE` | bool | No | `true` | Whether task is included in batch runs |

### Active Filter

Tasks can be marked as **active** or **inactive**:
- **Active tasks** (default): Included in batch report runs
- **Inactive tasks**: Excluded from batch runs but can still be run manually

Toggle active status via the UI (More actions → Activate/Deactivate) or API.

### Batch Scheduling

Run all active tasks matching a frequency:
```bash
python fetch_reports_from_alma_analytics.py --config reports_config.json --report-type daily
python fetch_reports_from_alma_analytics.py --config reports_config.json --report-type weekly
```

Only tasks with matching `FREQUENCY` **and** `ACTIVE=true` are executed.

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
