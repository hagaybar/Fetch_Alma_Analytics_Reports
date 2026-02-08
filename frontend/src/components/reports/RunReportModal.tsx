import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { JobStatusCard } from './JobStatus';
import { useJobPolling } from '../../hooks';
import type { Task, Job } from '../../types';

interface RunReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  testMode: boolean;
  onRun: (taskName: string, testMode: boolean) => Promise<Job>;
}

export function RunReportModal({ isOpen, onClose, task, testMode, onRun }: RunReportModalProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { job } = useJobPolling(jobId);

  const handleRun = async () => {
    if (!task) return;

    setStarting(true);
    setError(null);

    try {
      const newJob = await onRun(task.name, testMode);
      setJobId(newJob.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start report');
    } finally {
      setStarting(false);
    }
  };

  const handleClose = () => {
    setJobId(null);
    setError(null);
    onClose();
  };

  const isRunning = job?.status === 'pending' || job?.status === 'running';
  const isComplete = job?.status === 'completed' || job?.status === 'failed' || job?.status === 'cancelled';

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Run Report: ${task.name}`}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {isComplete ? 'Close' : 'Cancel'}
          </Button>
          {!jobId && (
            <Button onClick={handleRun} disabled={starting}>
              {starting ? 'Starting...' : testMode ? 'Run Test' : 'Run Report'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {testMode && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Running in test mode: limited to {task.test_row_limit} rows
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        {!jobId && !error && (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            <p>
              <strong>Report:</strong> {task.alma_report_path}
            </p>
            <p>
              <strong>Output:</strong> {task.output_file_name}
            </p>
          </div>
        )}

        {job && <JobStatusCard job={job} />}

        {isRunning && (
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Please wait while the report is being fetched...
          </p>
        )}
      </div>
    </Modal>
  );
}
