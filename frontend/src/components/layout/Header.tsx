import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, onRefresh, actions }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {actions}
      </div>
    </header>
  );
}
