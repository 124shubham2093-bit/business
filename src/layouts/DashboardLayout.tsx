import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

interface DashboardLayoutProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ searchQuery, setSearchQuery }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <Topbar
          onMenuOpen={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic page routes */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
