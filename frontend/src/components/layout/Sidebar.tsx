import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/tasks', label: 'Tasks', icon: 'assignment' },
  { to: '/logs', label: 'Logs', icon: 'history' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Logo section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-icons-round text-lg">auto_awesome</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Alma Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Analytics Manager</p>
        </div>
      </div>

      {/* Navigation section */}
      <nav className="mt-4 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary border-r-4 border-primary font-medium'
                : 'flex items-center gap-3 px-6 py-3 text-slate-600 hover:bg-slate-50 transition-colors font-medium'
            }
          >
            <span className="material-icons-round">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
