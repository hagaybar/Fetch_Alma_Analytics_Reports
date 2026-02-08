# Alma Analytics Report Fetcher

This utility automates the download of Alma Analytics reports using the Alma Analytics API. It supports multiple task definitions via a shared JSON configuration file and is designed for robust production use with optional safe test mode.

**Now with a React Web UI for easier task management!**

---

## Features

- Fetches reports from Alma Analytics via API
- Supports CSV, TSV, and Excel (XLSX) outputs
- **Web UI** for managing tasks, running reports, and viewing logs
- **REST API** for programmatic access
- Allows test-mode runs with:
  - Limited rows
  - Separate output folder
  - Separate logging
- Robust logging per task
- CLI-based operation (legacy)
- Compatible with Windows Task Scheduler

---

## Quick Start

### Option 1: Web UI (Recommended)

```bash
# Set API key
export ALMA_PROD_API_KEY=your_api_key

# Start backend (from project root)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Option 2: CLI (Legacy)

```bash
# Set API key
export ALMA_PROD_API_KEY=your_api_key

# Production run
python legacy/fetch_reports_from_alma_analytics.py --task <task_name> --config reports_config.json

# Test mode
python legacy/fetch_reports_from_alma_analytics.py --task <task_name> --config reports_config.json --test-mode
```

---

## Project Structure

```
Fetch_Alma_Analytics_Reports/
├── backend/                    # FastAPI backend
│   ├── main.py                 # API entry point
│   ├── requirements.txt
│   ├── api/routes/             # REST endpoints
│   ├── core/                   # Business logic
│   └── models/                 # Pydantic models
│
├── frontend/                   # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # React hooks
│   │   └── api/                # API client
│
├── legacy/                     # Original CLI script
│   └── fetch_reports_from_alma_analytics.py
│
└── reports_config.json         # Shared task configuration
```

---

## Web UI Features

- **Dashboard**: View stats and recent job history
- **Tasks**: Add, edit, delete task configurations
- **Run Reports**: Execute reports with real-time progress
- **Test Mode**: Run with limited rows for testing
- **Logs**: Browse and view log files

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/tasks | List all tasks |
| POST | /api/v1/tasks | Create task |
| PUT | /api/v1/tasks/{name} | Update task |
| DELETE | /api/v1/tasks/{name} | Delete task |
| POST | /api/v1/reports/run | Run report |
| GET | /api/v1/reports/jobs | List jobs |
| GET | /api/v1/reports/jobs/{id} | Get job status |
| GET | /api/v1/logs/{task} | List log files |

---

## Requirements

**Backend:**
- Python 3.8+
- FastAPI, uvicorn, requests, openpyxl, pydantic

**Frontend:**
- Node.js 18+
- React 18, TypeScript, Vite, Tailwind CSS

**Environment:**
- `ALMA_PROD_API_KEY` - Your Alma Analytics API key

---

## Config File Format

The config file (`reports_config.json`) is a JSON object where each key is a task name:

```json
{
  "example_task": {
    "ALMA_REPORT_PATH": "%2Fshared%2FYourInstitution%2FReports%2FYourFolder%2FYourReportName",
    "OUTPUT_PATH": "/path/to/output",
    "OUTPUT_FILE_NAME": "output.xlsx",
    "OUTPUT_FORMAT": "xlsx",
    "LOG_DIR": "/path/to/logs",
    "TEST_OUTPUT_PATH": "/path/to/test/output",
    "TEST_LOG_DIR": "/path/to/test/logs",
    "TEST_ROW_LIMIT": 25
  }
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `ALMA_REPORT_PATH` | Encoded report path in Alma Analytics (from URL after `&path=`) |
| `OUTPUT_PATH` | Folder where final file will be written |
| `OUTPUT_FILE_NAME` | Name of the output file |
| `OUTPUT_FORMAT` | `xlsx`, `csv`, or `tsv` |
| `LOG_DIR` | Folder for log files |
| `TEST_OUTPUT_PATH` | (Optional) Folder for test-mode output |
| `TEST_LOG_DIR` | (Optional) Folder for test-mode logs |
| `TEST_ROW_LIMIT` | (Optional) Max rows in test mode |

---

## Logging

- Logs are stored in `LOG_DIR` (or `TEST_LOG_DIR` in test mode)
- Filename: `download_analytics_log_YYYYMMDD_HHMMSS.log`
- View logs via the web UI or directly in the log directory

---

## Known Limitations

- Does not support reports with input prompts
- No scheduled authentication refresh (API key must be valid)
- Hardcoded to EU API endpoint

---

## Development

```bash
# Backend development
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend development
cd frontend
npm install
npm run dev

# Type checking
cd frontend && npx tsc --noEmit
```

---

## License

This project is open-source and licensed under the MIT License.

Created and maintained by the TAU Development Team – Tel Aviv University Libraries
