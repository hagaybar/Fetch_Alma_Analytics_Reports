# Alma Analytics Report Fetcher

This utility automates the download of Alma Analytics reports using the Alma Analytics API. It supports multiple task definitions via a shared JSON configuration file and is designed for robust production use with optional safe test mode.

---

## ✨ Features

- Fetches reports from Alma Analytics via API
- Supports CSV, TSV, and Excel (XLSX) outputs
- Allows test-mode runs with:
  - Limited rows
  - Separate output folder
  - Separate logging
- Robust logging per task
- CLI-based operation
- Compatible with Windows Task Scheduler

---

## ⚙️ How It Works

The script:

1. Loads a JSON config file with multiple report tasks
2. Selects a single task via `--task` argument
3. Fetches report metadata and paginated data from Alma Analytics
4. Writes the data to disk in the specified format
5. Logs all activity to a per-task log file

---

## 🔧 Requirements

- Python 3.8+
- Packages: `openpyxl`, `requests`
- Alma API key with access to Analytics API

Set your API key in the environment before running:

```bash
set ALMA_PROD_API_KEY=your_api_key_here     # Windows CMD
$env:ALMA_PROD_API_KEY="your_api_key_here"  # PowerShell
```

---

## 🔺 Command Usage

### Production Run:

```bash
python fetch_reports_from_alma_analytics.py --task [task_name] --config [path_to_config.json]
```

**Example:**

```bash
python fetch_reports_from_alma_analytics.py --task funds_of_polines --config C:\Scripts\Prod\Fetch_Analytics_v2\reports_config.json
```

### Test Mode (safe run):

```bash
python fetch_reports_from_alma_analytics.py --task [task_name] --config [path_to_config.json] --test-mode
```

This will:

- Limit row download to `TEST_ROW_LIMIT`
- Output to `TEST_OUTPUT_PATH`
- Log to `TEST_LOG_DIR`

---

## 📁 Config File Format

The config file is a JSON object where each key is a task name:

```json
{
  "example_task": {
    "ALMA_REPORT_PATH": "%2Fshared%2FYourInstitution%2FReports%2FYourFolder%2FYourReportName",
    "OUTPUT_PATH": "C:/Path/To/Reports/Prod",
    "OUTPUT_FILE_NAME": "output_filename.xlsx",
    "OUTPUT_FORMAT": "xlsx",
    "LOG_DIR": "C:/Path/To/Logs/YourTask",

    "TEST_OUTPUT_PATH": "C:/Path/To/Reports/Test",
    "TEST_LOG_DIR": "C:/Path/To/Logs/Test",
    "TEST_ROW_LIMIT": 25
  }
}
```

### Field Descriptions

| Field              | Description                                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ALMA_REPORT_PATH` | Encoded report path in Alma Analytics (must be flat, no prompts). This value is extracted from the URL of a full report in Alma Analytics. Copy the string that comes **after** `&path=` from the report URL. **Do not remove** the initial `%2F` — it is required. |
| `OUTPUT_PATH`      | Folder where final file will be written                                                                                                                                                                                                                             |
| `OUTPUT_FILE_NAME` | Name of the final output file                                                                                                                                                                                                                                       |
| `OUTPUT_FORMAT`    | `xlsx`, `csv`, or `tsv`                                                                                                                                                                                                                                             |
| `LOG_DIR`          | Folder where log files for this task will be stored                                                                                                                                                                                                                 |
| `TEST_OUTPUT_PATH` | (Optional) Folder for test-mode output                                                                                                                                                                                                                              |
| `TEST_LOG_DIR`     | (Optional) Folder for test-mode log files                                                                                                                                                                                                                           |
| `TEST_ROW_LIMIT`   | (Optional) Limit number of rows fetched in test mode                                                                                                                                                                                                                |

---

## 🔢 Logging

- Logs are stored in `LOG_DIR` (or `TEST_LOG_DIR` when test mode is used)
- Filename: `download_analytics_log_YYYYMMDD_HHMMSS.log`
- Logged details include API calls, output file generation, error codes, and row counts

---

## 🚫 Known Limitations

- Does not support reports with input prompts
- Assumes consistent Alma Analytics schema
- No support for scheduled authentication refresh (API key must be valid)

---

## 👍 Best Practices

- Always test a new report with `--test-mode` first
- Set up a dedicated `tests` folder to avoid overwriting production files
- Use Power Automate or Task Scheduler to schedule periodic runs
- Monitor logs in Power BI for failed downloads or 500 errors

---

## ❓ Need Help?

If you're unsure about a report path or log behavior, start by:

- Running the script in `--test-mode`
- Checking the log file for any API or format errors

---

Created and maintained by the TAU Development Team – Tel Aviv University Libraries

---

## 📄 License

This project is open-source and licensed under the MIT License.

You are free to use, modify, and distribute this software under the terms of the license. See the [LICENSE](https://mit-license.org/) for full details.

