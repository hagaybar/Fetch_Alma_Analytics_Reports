import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, FileText, BookOpen } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/logs', label: 'Logs', icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      {/* Logo section */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[hsl(var(--border))] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
          <BookOpen className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Alma Reports
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Analytics Manager
          </span>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
