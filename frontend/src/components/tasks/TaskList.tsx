import { TaskCard } from './TaskCard';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRun: (task: Task, testMode: boolean) => void;
  onViewLogs: (task: Task) => void;
  onToggleActive: (task: Task) => void;
}

export function TaskList({ tasks, loading, onEdit, onDelete, onRun, onViewLogs, onToggleActive }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
        <p>No tasks configured</p>
        <p className="text-sm">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.name}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onRun={onRun}
          onViewLogs={onViewLogs}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
