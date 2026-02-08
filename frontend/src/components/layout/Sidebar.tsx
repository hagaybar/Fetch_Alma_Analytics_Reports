import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, FileText, BookOpen } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/logs', label: 'Logs', icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex h-16 items-center gap-2 border-b border-[hsl(var(--border))] px-6">
        <BookOpen className="h-6 w-6 text-[hsl(var(--primary))]" />
        <span className="text-lg font-semibold">Alma Reports</span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
