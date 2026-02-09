# Alma Analytics Report Fetcher - Setup Instructions

This guide walks you through setting up the Alma Analytics Report Fetcher on a new machine.

---

## Prerequisites

Before starting, ensure you have:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
   - During installation, check "Add Python to PATH"

2. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
   - LTS version recommended

3. **Git** - [Download Git](https://git-scm.com/downloads)

4. **Alma API Key** - Get this from your ExLibris Alma administrator

---

## Quick Start (Windows)

### Step 1: Clone the Repository

```cmd
git clone <repository-url>
cd Fetch_Alma_Analytics_Reports
git checkout feature/react-ui
```

### Step 2: Set Your API Key

**Command Prompt:**
```cmd
set ALMA_PROD_API_KEY=your_api_key_here
```

**PowerShell:**
```powershell
$env:ALMA_PROD_API_KEY = "your_api_key_here"
```

**Permanent (System Environment Variable):**
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → "Environment Variables"
3. Under "User variables", click "New"
4. Variable name: `ALMA_PROD_API_KEY`
5. Variable value: your API key
6. Click OK

### Step 3: Run the Application

**Using the batch script (recommended):**
```cmd
start.bat
```

**Or PowerShell script:**
```powershell
.\start.ps1
```

The script will:
- Install Python dependencies
- Install Node.js dependencies
- Build the frontend
- Start the server

### Step 4: Open the Web UI

Open your browser to: **http://localhost:8000**

---

## Manual Setup (Step by Step)

If the startup script fails, follow these steps manually:

### 1. Install Backend Dependencies

```cmd
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Install Frontend Dependencies

```cmd
cd frontend
npm install
```

### 3. Build Frontend

```cmd
npm run build
cd ..
```

### 4. Start the Server

```cmd
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Configuration

### Task Configuration File

All tasks are stored in `reports_config.json` in the project root.

You can edit this file directly or use the web UI to manage tasks.

**Example task:**
```json
{
  "my_report": {
    "ALMA_REPORT_PATH": "%2Fshared%2FYour%20Institution%2FReports%2FFolder%2FReport",
    "OUTPUT_PATH": "D:\\Reports\\Output",
    "OUTPUT_FILE_NAME": "my_report.xlsx",
    "OUTPUT_FORMAT": "xlsx",
    "LOG_DIR": "D:\\Reports\\Logs",
    "TEST_OUTPUT_PATH": "D:\\Reports\\Test",
    "TEST_LOG_DIR": "D:\\Reports\\Logs\\Test",
    "TEST_ROW_LIMIT": 25
  }
}
```

### Finding the Alma Report Path

1. Open Alma Analytics in your browser
2. Navigate to the report you want to fetch
3. Look at the URL - find the part after `&path=`
4. Copy that entire encoded path (starts with `%2F`)

---

## Using the Web UI

### Dashboard
- View statistics: total tasks, running/completed/failed jobs
- See recent job history

### Tasks Page
- **View all tasks** as cards
- **Add new task**: Click "New Task" button
- **Edit task**: Click the pencil icon on a task card
- **Delete task**: Click the trash icon
- **Run report**: Click "Run" for production or "Test" for test mode

### Logs Page
- Select a task from the dropdown
- View list of log files
- Click a file to view its contents

---

## Running Reports

### From the Web UI

1. Go to the Tasks page
2. Find the task you want to run
3. Click "Run" (full report) or "Test" (limited rows)
4. Watch the progress in the modal
5. The output file is saved to the configured path

### From Command Line (Legacy)

```cmd
python legacy\fetch_reports_from_alma_analytics.py --task my_report --config reports_config.json
```

With test mode:
```cmd
python legacy\fetch_reports_from_alma_analytics.py --task my_report --config reports_config.json --test-mode
```

---

## Running as a Windows Service

For production, you may want to run the server as a Windows service.

### Using NSSM (Non-Sucking Service Manager)

1. Download NSSM: https://nssm.cc/download

2. Install the service:
```cmd
nssm install AlmaReportFetcher
```

3. In the dialog:
   - **Path**: `C:\Python3x\python.exe`
   - **Startup directory**: `C:\path\to\Fetch_Alma_Analytics_Reports\backend`
   - **Arguments**: `-m uvicorn main:app --host 0.0.0.0 --port 8000`

4. Go to Environment tab, add:
   ```
   ALMA_PROD_API_KEY=your_api_key
   ```

5. Start the service:
```cmd
nssm start AlmaReportFetcher
```

---

## Scheduled Tasks

You can still use Windows Task Scheduler with the legacy CLI script:

1. Open Task Scheduler
2. Create a new task
3. Set the action to run:
   - Program: `python`
   - Arguments: `C:\path\to\legacy\fetch_reports_from_alma_analytics.py --task my_report --config C:\path\to\reports_config.json`
4. Set your desired schedule

---

## Troubleshooting

### "ALMA_PROD_API_KEY not set"
Set the environment variable as shown in Step 2 above.

### "python/npm not found"
Ensure Python and Node.js are installed and added to your PATH.
Restart your terminal after installation.

### "Module not found" errors
Run the dependency installation again:
```cmd
cd backend && pip install -r requirements.txt
cd ..\frontend && npm install
```

### Frontend not loading
Rebuild the frontend:
```cmd
cd frontend
npm run build
```

### Port already in use
Change the port:
```cmd
start.bat 8080
```

### API errors (401, 403)
- Verify your API key is correct
- Check the key has Analytics API permissions in Alma

---

## Updating

To update to a new version:

```cmd
git pull origin feature/react-ui
cd frontend
npm install
npm run build
```

Then restart the server.

---

## Support

For issues:
1. Check the log files in the configured LOG_DIR
2. Check the browser console for frontend errors
3. Check the terminal output for backend errors

---

*Created by TAU Development Team – Tel Aviv University Libraries*
