import os
import sys
import json
import argparse
import logging
import datetime
import csv
import openpyxl
import xml.etree.ElementTree as ET
import requests
from urllib.parse import unquote


def setup_logging(log_dir):
    os.makedirs(log_dir, exist_ok=True)
    log_filename = os.path.join(log_dir, f"download_analytics_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    logging.basicConfig(filename=log_filename, level=logging.DEBUG,
                        format='%(asctime)s - %(levelname)s - %(message)s')

def generate_filename(output_path, output_file_name):
    '''
    Generate a filename with a timestamp appended to the original filename. currently not used.
    '''
    now = datetime.datetime.now()
    formatted_date = now.strftime("%d-%m-%y_%H_%M_%S")
    filename, ext = os.path.splitext(output_file_name)
    return os.path.join(output_path, f"{filename}_{formatted_date}{ext}")

def get_report_headers(api_key, report_path):
    url = "https://api-eu.hosted.exlibrisgroup.com/almaws/v1/analytics/reports"
    headers = {"Authorization": f"apikey {api_key}", "Accept": "application/json"}
    params = {"path": unquote(report_path)}
    try:
        logging.debug(f"get_report_headers Requesting: {url}")
        logging.debug(f"get_report_headers Params: {params}")
        logging.debug(f"get_report_headers Headers: {headers}")
        resp = requests.get(url, headers=headers, params=params)
        if resp.status_code != 200:
            logging.error(f"Failed to get headers: {resp.status_code}")
            return {}
        xml = resp.json().get("anies", [None])[0]
        if not xml:
            return {}
        root = ET.fromstring(xml)
        cols = {}
        for e in root.findall(".//{http://www.w3.org/2001/XMLSchema}element"):
            name = e.attrib.get("name")
            heading = e.attrib.get("{urn:saw-sql}columnHeading", name)
            cols[name] = heading
        return cols
    except Exception as e:
        logging.error(f"Error fetching headers: {e}")
        return {}

def fetch_rows(api_key, report_path, limit=1000, max_rows=None):
    
    url = "https://api-eu.hosted.exlibrisgroup.com/almaws/v1/analytics/reports"
    headers = {"Authorization": f"apikey {api_key}", "Accept": "application/json"}
    params = {"path": unquote(report_path), "limit": str(limit)}
    token = None
    total_yielded = 0

    while True:
        if token:
            params['token'] = token

        logging.debug(f"fetch_rows Requesting: {url}")
        logging.debug(f"fetch_rows Params: {params}")
        logging.debug(f"fetch_rows Headers: {headers}")

        resp = requests.get(url, headers=headers, params=params)
        if resp.status_code != 200:
            logging.error(f"Failed to fetch rows: {resp.status_code}")
            try:
                logging.error(f"Response content: {resp.text}")
            except Exception as e:
                logging.error(f"Error reading response content: {e}")
            break

        xml = resp.json().get("anies", [None])[0]
        if not xml:
            break

        root = ET.fromstring(xml)
        ns = {'ns0': 'urn:schemas-microsoft-com:xml-analysis:rowset'}

        for row in root.findall('.//ns0:Row', ns):
            row_data = {cell.tag.split('}')[-1]: cell.text for cell in row}
            yield row_data
            total_yielded += 1
            if max_rows and total_yielded >= max_rows:
                logging.info(f"[TEST MODE] Reached max rows limit: {max_rows}")
                return
        token_elem = root.find('.//ResumptionToken')
        is_finished = root.find('.//IsFinished')
        if is_finished is not None and is_finished.text == 'true':
            break
        token = token_elem.text if token_elem is not None else None

def write_output(format, headers, rows, output_file):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    if format == 'xlsx':
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(list(headers.values()))
        for row in rows:
            ws.append([row.get(k, '') for k in headers.keys()])
        wb.save(output_file)
    else:
        delimiter = '\t' if format == 'tsv' else ','
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f, delimiter=delimiter)
            writer.writerow(headers.values())
            for row in rows:
                writer.writerow([row.get(k, '') for k in headers.keys()])

def run_single_report(task_name, config, args, api_key):
    """
    Run a single report task and return success status.

    Args:
        task_name: Name of the task/report
        config: Configuration dict for this task
        args: Parsed command line arguments
        api_key: Alma API key

    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        max_rows = config.get('TEST_ROW_LIMIT', None) if args.test_mode else None
        report_path = config['ALMA_REPORT_PATH']
        output_file = config['OUTPUT_FILE_NAME']
        output_format = config.get('OUTPUT_FORMAT', 'xlsx').lower()
        is_test = args.test_mode
        output_path = config.get('TEST_OUTPUT_PATH') if is_test and 'TEST_OUTPUT_PATH' in config else config['OUTPUT_PATH']
        log_dir = config.get('TEST_LOG_DIR') if is_test and 'TEST_LOG_DIR' in config else config['LOG_DIR']

        setup_logging(log_dir)
        logging.info(f"Started task: {task_name}")

        print(f"Running task: {task_name}")
        print(f"Using API key: {api_key}, "
              f"Report Path: {report_path}, "
              f"Output Path: {output_path}, "
              f"Output File: {output_file}, "
              f"Output Format: {output_format}")

        logging.info(f"Task: {task_name}")
        logging.info(f"Report path: {report_path}")
        logging.info(f"Output file: {os.path.join(output_path, output_file)}")
        logging.info(f"Test mode: {args.test_mode}")

        headers = get_report_headers(api_key, report_path)
        if not headers:
            error_msg = f"No headers found for task {task_name}"
            logging.error(error_msg)
            return False, error_msg

        max_rows = config.get('TEST_ROW_LIMIT') if args.test_mode else None

        rows = list(fetch_rows(api_key, report_path, limit=1000, max_rows=max_rows))
        out_file = os.path.join(output_path, output_file)
        write_output(output_format, headers, rows, out_file)
        success_msg = f"Finished task {task_name}. Output: {out_file}, Rows: {len(rows)}"
        logging.info(success_msg)
        return True, success_msg

    except Exception as e:
        error_msg = f"Error running task {task_name}: {str(e)}"
        logging.error(error_msg)
        return False, error_msg


def run_batch_reports(all_configs, report_type, args):
    """
    Run all reports matching the specified frequency type.

    Args:
        all_configs: Dict of all task configurations
        report_type: Frequency type to filter by ("daily" or "weekly")
        args: Parsed command line arguments

    Returns:
        tuple: (success_count: int, failure_count: int, results: list)
    """
    api_key = os.getenv('ALMA_PROD_API_KEY')
    if not api_key:
        logging.error("ALMA_PROD_API_KEY environment variable not set")
        print("Error: ALMA_PROD_API_KEY environment variable not set")
        return 0, 0, []

    # Filter configs by frequency
    matching_tasks = []
    for task_name, config in all_configs.items():
        frequency = config.get('FREQUENCY', '').lower()
        if frequency == report_type.lower():
            matching_tasks.append((task_name, config))

    if not matching_tasks:
        logging.warning(f"No reports found with frequency '{report_type}'")
        print(f"No reports found with frequency '{report_type}'")
        return 0, 0, []

    logging.info(f"Found {len(matching_tasks)} reports with frequency '{report_type}'")
    print(f"Found {len(matching_tasks)} reports with frequency '{report_type}'")

    success_count = 0
    failure_count = 0
    results = []

    for task_name, config in matching_tasks:
        print(f"\n{'='*60}")
        print(f"Running report: {task_name}")
        print(f"{'='*60}")

        success, message = run_single_report(task_name, config, args, api_key)

        if success:
            success_count += 1
            results.append({'task': task_name, 'status': 'success', 'message': message})
        else:
            failure_count += 1
            results.append({'task': task_name, 'status': 'failed', 'message': message})
            print(f"Error: {message}")
            logging.error(f"Task {task_name} failed: {message}")

    return success_count, failure_count, results


def main():
    parser = argparse.ArgumentParser(
        description='Fetch reports from Alma Analytics. Run a single task or batch by frequency.'
    )
    parser.add_argument('--task', required=False,
                        help='Name of a single task to run (required if --report-type not provided)')
    parser.add_argument('--report-type', choices=['daily', 'weekly'],
                        help='Run all reports with this frequency (daily or weekly)')
    parser.add_argument('--config', required=True,
                        help='Path to the configuration JSON file')
    parser.add_argument('--test-mode', action='store_true',
                        help='Run in test mode with limited rows')
    args = parser.parse_args()

    # Validate arguments: either --task or --report-type must be provided
    if not args.task and not args.report_type:
        parser.error("Either --task or --report-type must be provided")

    with open(args.config, 'r') as f:
        all_configs = json.load(f)

    # Batch mode: run all reports matching the frequency
    if args.report_type:
        print(f"\n{'='*60}")
        print(f"BATCH MODE: Running all '{args.report_type}' reports")
        print(f"{'='*60}")

        success_count, failure_count, results = run_batch_reports(all_configs, args.report_type, args)

        # Print summary
        print(f"\n{'='*60}")
        print("BATCH EXECUTION SUMMARY")
        print(f"{'='*60}")
        print(f"Report type: {args.report_type}")
        print(f"Total reports: {success_count + failure_count}")
        print(f"Succeeded: {success_count}")
        print(f"Failed: {failure_count}")

        if results:
            print(f"\nDetailed results:")
            for result in results:
                status_icon = "[OK]" if result['status'] == 'success' else "[FAILED]"
                print(f"  {status_icon} {result['task']}")

        logging.info(f"Batch execution completed. Success: {success_count}, Failed: {failure_count}")

        # Exit with error code if any reports failed
        if failure_count > 0:
            sys.exit(1)
        return

    # Single task mode: run a specific task (backward compatibility)
    if args.task not in all_configs:
        print(f"Error: Task '{args.task}' not found in configuration")
        logging.error(f"Task '{args.task}' not found in configuration")
        sys.exit(1)

    config = all_configs[args.task]
    api_key = os.getenv('ALMA_PROD_API_KEY')
    if not api_key:
        print("Error: ALMA_PROD_API_KEY environment variable not set")
        sys.exit(1)

    success, message = run_single_report(args.task, config, args, api_key)
    if not success:
        print(f"Error: {message}")
        sys.exit(1)
    print(message)

if __name__ == '__main__':
    main()
