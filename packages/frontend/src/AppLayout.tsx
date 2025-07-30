import type { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
