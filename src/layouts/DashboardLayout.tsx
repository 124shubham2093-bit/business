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
    <div className="flex h-screen overflow-hidden bg-dark-bg text-gray-200">
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
          {/* Subtle background glow ambient effects */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-brand-purple-light/5 rounded-full blur-[120px] pointer-events-none -z-10" />

          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
