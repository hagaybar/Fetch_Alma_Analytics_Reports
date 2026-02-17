interface HeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, description, onRefresh, actions }: HeaderProps) {
  return (
    <header className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all"
          >
            <span className="material-icons-round text-lg">refresh</span>
            Refresh
          </button>
        )}
        {actions}
      </div>
    </header>
  );
}
