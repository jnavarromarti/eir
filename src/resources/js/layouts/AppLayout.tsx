import { Outlet } from 'react-router';
import Sidebar from '@/components/sidebar/Sidebar';
import Topbar from '@/components/shared/Topbar';
import { useState } from 'react';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface-sunken">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,81,177,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(106,27,124,0.08),transparent_26%)]" />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <main className="flex-1 overflow-y-auto p-4 animate-fade-in sm:p-6">
          <div className="mx-auto flex min-h-full w-full max-w-[1680px] flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
