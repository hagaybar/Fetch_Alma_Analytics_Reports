import { useState, useRef, useEffect } from 'react';
import { Play, Edit2, Trash2, FileText, TestTube, MoreVertical } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const formatBadge = task.output_format.toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{task.name}</CardTitle>
          <Badge variant="outline">{formatBadge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
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
      <CardFooter className="flex-wrap gap-3 mt-4">
        <Button onClick={() => onRun(task, false)} className="flex-1">
          <Play className="h-4 w-4" />
          Run
        </Button>
        <Button variant="secondary" onClick={() => onRun(task, true)}>
          <TestTube className="h-4 w-4" />
          Test
        </Button>
        <div className="relative" ref={menuRef}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] text-left"
                onClick={() => handleMenuAction(() => onViewLogs(task))}
              >
                <FileText className="h-4 w-4" />
                View Logs
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] text-left"
                onClick={() => handleMenuAction(() => onEdit(task))}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] text-left text-[hsl(var(--destructive))]"
                onClick={() => handleMenuAction(() => onDelete(task))}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
