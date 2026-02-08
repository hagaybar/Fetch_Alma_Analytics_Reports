import { Play, Edit2, Trash2, FileText, TestTube } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRun: (task: Task, testMode: boolean) => void;
  onViewLogs: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onRun, onViewLogs }: TaskCardProps) {
  const formatBadge = task.output_format.toUpperCase();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{task.name}</CardTitle>
          <Badge variant="outline">{formatBadge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
        <p className="truncate" title={task.output_file_name}>
          <span className="font-medium text-[hsl(var(--foreground))]">Output:</span>{' '}
          {task.output_file_name}
        </p>
        <p className="truncate" title={task.output_path}>
          <span className="font-medium text-[hsl(var(--foreground))]">Path:</span> {task.output_path}
        </p>
        {task.test_row_limit && (
          <p>
            <span className="font-medium text-[hsl(var(--foreground))]">Test limit:</span>{' '}
            {task.test_row_limit} rows
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap gap-2 pt-4">
        <Button size="sm" onClick={() => onRun(task, false)} className="flex-1">
          <Play className="h-3.5 w-3.5" />
          Run
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onRun(task, true)}>
          <TestTube className="h-3.5 w-3.5" />
          Test
        </Button>
        <Button size="sm" variant="outline" onClick={() => onViewLogs(task)}>
          <FileText className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(task)}>
          <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
        </Button>
      </CardFooter>
    </Card>
  );
}
