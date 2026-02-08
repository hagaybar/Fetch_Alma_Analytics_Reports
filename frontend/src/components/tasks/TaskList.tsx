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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
