import { Loader2, CheckCircle, XCircle, Clock, StopCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Job, JobStatus as JobStatusType } from '../../types';

interface JobStatusProps {
  job: Job;
  compact?: boolean;
}

const statusConfig: Record<
  JobStatusType,
  { icon: typeof Loader2; label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }
> = {
  pending: { icon: Clock, label: 'Pending', variant: 'outline' },
  running: { icon: Loader2, label: 'Running', variant: 'warning' },
  completed: { icon: CheckCircle, label: 'Completed', variant: 'success' },
  failed: { icon: XCircle, label: 'Failed', variant: 'destructive' },
  cancelled: { icon: StopCircle, label: 'Cancelled', variant: 'outline' },
};

export function JobStatusBadge({ job, compact }: JobStatusProps) {
  const config = statusConfig[job.status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${job.status === 'running' ? 'animate-spin' : ''}`} />
      {!compact && config.label}
    </Badge>
  );
}

export function JobStatusCard({ job }: { job: Job }) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString();

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{job.task_name}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Job ID: {job.id} {job.test_mode && '(Test Mode)'}
          </p>
        </div>
        <JobStatusBadge job={job} />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          <span className="text-[hsl(var(--muted-foreground))]">Started:</span>{' '}
          {formatDate(job.started_at)}
        </p>
        {job.completed_at && (
          <p>
            <span className="text-[hsl(var(--muted-foreground))]">Completed:</span>{' '}
            {formatDate(job.completed_at)}
          </p>
        )}
        <p>
          <span className="text-[hsl(var(--muted-foreground))]">Rows fetched:</span>{' '}
          {job.rows_fetched}
        </p>
        {job.progress_message && (
          <p className="text-[hsl(var(--muted-foreground))]">{job.progress_message}</p>
        )}
        {job.output_file && (
          <p className="truncate" title={job.output_file}>
            <span className="text-[hsl(var(--muted-foreground))]">Output:</span> {job.output_file}
          </p>
        )}
        {job.error_message && (
          <p className="text-[hsl(var(--destructive))]">{job.error_message}</p>
        )}
      </div>
    </div>
  );
}
