import type { Task } from '../../types';
import { FrequencyBadge, FormatBadge } from '../ui/Badge';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRun: (task: Task, testMode: boolean) => void;
  onViewLogs: (task: Task) => void;
}

// Helper to truncate path for display
function truncatePath(path: string, maxLength: number = 40): string {
  if (path.length <= maxLength) return path;
  const parts = path.split(/[/\\]/);
  if (parts.length <= 2) return path;
  const first = parts[0];
  const last = parts.slice(-2).join('/');
  return `${first}.../${last}`;
}

// Get icon based on format
function getFormatIcon(format: string): string {
  switch (format.toLowerCase()) {
    case 'xlsx':
      return 'description';
    case 'csv':
      return 'description';
    case 'tsv':
      return 'table_chart';
    default:
      return 'description';
  }
}

export function TaskCard({ task, onEdit, onDelete, onRun }: TaskCardProps) {
  const frequency = (task.frequency || 'daily') as 'daily' | 'weekly' | 'monthly' | 'on_demand';
  const formatIcon = getFormatIcon(task.output_format);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-shadow group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-primary rounded-xl">
            <span className="material-icons-round">{formatIcon}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{task.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <FrequencyBadge frequency={frequency} />
              <span className="text-xs text-slate-400">|</span>
              <FormatBadge format={task.output_format} />
            </div>
          </div>
        </div>
        {/* Edit/Delete buttons - appear on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Edit task"
          >
            <span className="material-icons-round text-lg">edit</span>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500"
            aria-label="Delete task"
          >
            <span className="material-icons-round text-lg">delete_outline</span>
          </button>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-400 w-16">Output:</span>
          <span className="text-slate-700 dark:text-slate-300 truncate" title={task.output_file_name}>
            {task.output_file_name}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-16">Path:</span>
          <span className="text-slate-700 dark:text-slate-300 truncate" title={task.output_path}>
            {truncatePath(task.output_path)}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-16">Limit:</span>
          <span className="text-slate-700 dark:text-slate-300">
            {task.test_row_limit ? `${task.test_row_limit} rows` : 'Unlimited'}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onRun(task, false)}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <span className="material-icons-round text-lg">play_arrow</span>
          Run Task
        </button>
        <button
          onClick={() => onRun(task, true)}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold"
        >
          Test
        </button>
      </div>
    </div>
  );
}
