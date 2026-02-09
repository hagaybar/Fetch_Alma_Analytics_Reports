import os
import csv
import logging
import datetime
import xml.etree.ElementTree as ET
from typing import Dict, Generator, Callable, Optional
from urllib.parse import unquote
import requests
import openpyxl


class AlmaFetcher:
    API_URL = "https://api-eu.hosted.exlibrisgroup.com/almaws/v1/analytics/reports"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"apikey {api_key}",
            "Accept": "application/json"
        }

    def get_report_headers(self, report_path: str) -> Dict[str, str]:
        params = {"path": unquote(report_path)}
        try:
            logging.debug(f"get_report_headers Requesting: {self.API_URL}")
            resp = requests.get(self.API_URL, headers=self.headers, params=params)
            if resp.status_code != 200:
                logging.error(f"Failed to get headers: {resp.status_code}")
                return {}
            xml_data = resp.json().get("anies", [None])[0]
            if not xml_data:
                return {}
            root = ET.fromstring(xml_data)
            cols = {}
            for e in root.findall(".//{http://www.w3.org/2001/XMLSchema}element"):
                name = e.attrib.get("name")
                heading = e.attrib.get("{urn:saw-sql}columnHeading", name)
                cols[name] = heading
            return cols
        except Exception as e:
            logging.error(f"Error fetching headers: {e}")
            return {}

    def fetch_rows(
        self,
        report_path: str,
        limit: int = 1000,
        max_rows: Optional[int] = None,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Generator[Dict, None, None]:
        params = {"path": unquote(report_path), "limit": str(limit)}
        token = None
        total_yielded = 0

        while True:
            if token:
                params['token'] = token

            logging.debug(f"fetch_rows Requesting: {self.API_URL}")
            resp = requests.get(self.API_URL, headers=self.headers, params=params)

            if resp.status_code != 200:
                logging.error(f"Failed to fetch rows: {resp.status_code}")
                try:
                    logging.error(f"Response content: {resp.text}")
                except Exception as e:
                    logging.error(f"Error reading response content: {e}")
                break

            xml_data = resp.json().get("anies", [None])[0]
            if not xml_data:
                break

            root = ET.fromstring(xml_data)
            ns = {'ns0': 'urn:schemas-microsoft-com:xml-analysis:rowset'}

            for row in root.findall('.//ns0:Row', ns):
                row_data = {cell.tag.split('}')[-1]: cell.text for cell in row}
                yield row_data
                total_yielded += 1

                if progress_callback and total_yielded % 100 == 0:
                    progress_callback(total_yielded, f"Fetched {total_yielded} rows...")

                if max_rows and total_yielded >= max_rows:
                    logging.info(f"[TEST MODE] Reached max rows limit: {max_rows}")
                    return

            token_elem = root.find('.//ResumptionToken')
            is_finished = root.find('.//IsFinished')
            if is_finished is not None and is_finished.text == 'true':
                break
            token = token_elem.text if token_elem is not None else None

    def write_output(
        self,
        output_format: str,
        headers: Dict[str, str],
        rows: list,
        output_file: str
    ):
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        if output_format == 'xlsx':
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.append(list(headers.values()))
            for row in rows:
                ws.append([row.get(k, '') for k in headers.keys()])
            wb.save(output_file)
        else:
            delimiter = '\t' if output_format == 'tsv' else ','
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f, delimiter=delimiter)
                writer.writerow(headers.values())
                for row in rows:
                    writer.writerow([row.get(k, '') for k in headers.keys()])

    def run_report(
        self,
        config: Dict,
        test_mode: bool = False,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> tuple[str, int]:
        report_path = config['ALMA_REPORT_PATH']
        output_file = config['OUTPUT_FILE_NAME']
        output_format = config.get('OUTPUT_FORMAT', 'xlsx').lower()

        if test_mode:
            output_path = config.get('TEST_OUTPUT_PATH', config['OUTPUT_PATH'])
            max_rows = config.get('TEST_ROW_LIMIT')
        else:
            output_path = config['OUTPUT_PATH']
            max_rows = None

        logging.info(f"Report path: {report_path}")
        logging.info(f"Test mode: {test_mode}")

        headers = self.get_report_headers(report_path)
        if not headers:
            raise ValueError("No headers found for report")

        rows = list(self.fetch_rows(
            report_path,
            limit=1000,
            max_rows=max_rows,
            progress_callback=progress_callback
        ))

        out_file = os.path.join(output_path, output_file)
        self.write_output(output_format, headers, rows, out_file)

        logging.info(f"Finished. Output: {out_file}, Rows: {len(rows)}")
        return out_file, len(rows)
