import { TaskCard } from './TaskCard';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRun: (task: Task, testMode: boolean) => void;
  onViewLogs: (task: Task) => void;
}

export function TaskList({ tasks, loading, onEdit, onDelete, onRun, onViewLogs }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
        <span className="material-icons-round animate-spin mr-2">refresh</span>
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <span className="material-icons-round text-4xl mb-2 text-slate-300 dark:text-slate-600">assignment</span>
        <p className="font-medium">No tasks configured</p>
        <p className="text-sm">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.name}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onRun={onRun}
          onViewLogs={onViewLogs}
        />
      ))}
    </div>
  );
}
