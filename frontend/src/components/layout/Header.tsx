import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, description, onRefresh, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-8 py-5 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 text-sm font-medium">Refresh</span>
          </Button>
        )}
        {actions}
      </div>
    </header>
  );
}
