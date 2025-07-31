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

def fetch_rows(api_key, report_path, limit):
    url = "https://api-eu.hosted.exlibrisgroup.com/almaws/v1/analytics/reports"
    headers = {"Authorization": f"apikey {api_key}", "Accept": "application/json"}
    params = {"path": unquote(report_path), "limit": str(limit)}
    token = None

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
                logging.error(f"Response content: {resp.text()}")
            except Exception as e:
                logging.error(f"Error reading response content: {e}")
            break
        xml = resp.json().get("anies", [None])[0]
        if not xml:
            break
        root = ET.fromstring(xml)
        ns = {'ns0': 'urn:schemas-microsoft-com:xml-analysis:rowset'}
        for row in root.findall('.//ns0:Row', ns):
            yield {cell.tag.split('}')[-1]: cell.text for cell in row}
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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--task', required=True)
    parser.add_argument('--config', required=True)
    parser.add_argument('--test-mode', action='store_true')
    args = parser.parse_args()

    with open(args.config, 'r') as f:
        all_configs = json.load(f)

    config = all_configs[args.task]
    api_key = os.getenv('ALMA_PROD_API_KEY')
    report_path = config['ALMA_REPORT_PATH']
    output_file = config['OUTPUT_FILE_NAME']
    output_format = config.get('OUTPUT_FORMAT', 'xlsx').lower()
    is_test = args.test_mode
    output_path = config.get('TEST_OUTPUT_PATH') if is_test and 'TEST_OUTPUT_PATH' in config else config['OUTPUT_PATH']
    log_dir = config.get('TEST_LOG_DIR') if is_test and 'TEST_LOG_DIR' in config else config['LOG_DIR']


    print(f"Using API key: {api_key}, "
          f"Report Path: {report_path}, "
          f"Output Path: {output_path}, " 
          f"Output File: {output_file}, "
          f"Output Format: {output_format}")

    setup_logging(log_dir)
    logging.info(f"Started task: {args.task}")

    headers = get_report_headers(api_key, report_path)
    if not headers:
        logging.error("No headers found. Exiting.")
        return

    limit = 5 if args.test_mode else 1000
    rows = list(fetch_rows(api_key, report_path, limit))
    # use this line to generate file name with timestamp
    # out_file = generate_filename(output_path, output_file) 
    out_file = os.path.join(output_path, output_file)
    write_output(output_format, headers, rows, out_file)
    logging.info(f"Finished task. Output: {out_file}, Rows: {len(rows)}")

if __name__ == '__main__':
    main()
