import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Sidebar />
      <div className="min-h-screen" style={{ marginLeft: '16rem' }}>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
