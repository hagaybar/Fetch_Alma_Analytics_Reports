export interface Task {
  name: string;
  alma_report_path: string;
  output_path: string;
  output_file_name: string;
  output_format: string;
  log_dir: string;
  test_output_path?: string;
  test_log_dir?: string;
  test_row_limit: number;
  frequency?: 'daily' | 'weekly';
}

export interface TaskCreate {
  name: string;
  alma_report_path: string;
  output_path: string;
  output_file_name: string;
  output_format: string;
  log_dir: string;
  test_output_path?: string;
  test_log_dir?: string;
  test_row_limit: number;
  frequency?: 'daily' | 'weekly';
}

export interface TaskUpdate {
  alma_report_path: string;
  output_path: string;
  output_file_name: string;
  output_format: string;
  log_dir: string;
  test_output_path?: string;
  test_log_dir?: string;
  test_row_limit: number;
  frequency?: 'daily' | 'weekly';
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  task_name: string;
  test_mode: boolean;
  status: JobStatus;
  started_at: string;
  completed_at?: string;
  rows_fetched: number;
  output_file?: string;
  error_message?: string;
  progress_message: string;
}

export interface LogFile {
  name: string;
  path: string;
  size: number;
  modified: number;
}

export interface LogContent {
  content: string;
  name: string;
}
