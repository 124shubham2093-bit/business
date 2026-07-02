import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BarChart3, ShieldAlert, X, Sparkles, ShieldCheck } from 'lucide-react';
import { ACTIVE_SERVICE_MODE } from '../../services/investigation/config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Investigations', path: '/investigations', icon: Briefcase },
    { name: 'Analytics Trend', path: '/analytics', icon: BarChart3 },
    { name: 'New Investigation', path: '/new-investigation', icon: Sparkles },
    { name: 'Cognee Verify', path: '/cognee-verify', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-white/5 bg-dark-bg/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5 bg-white/2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-brand-purple" />
            <span className="text-sm font-bold tracking-wider text-white">ANTIGRAVITY</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border border-transparent ${
                  isActive
                    ? 'bg-brand-purple/10 text-brand-purple-light border-brand-purple/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-brand-purple-light' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-white/2">
          <div className="flex items-center justify-between px-2 text-xs text-gray-500">
            <span>Diligence Version 1.2.0</span>
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                ACTIVE_SERVICE_MODE === 'backend' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
              <span className={`${
                ACTIVE_SERVICE_MODE === 'backend' ? 'text-emerald-400' : 'text-amber-400'
              } font-semibold`}>
                {ACTIVE_SERVICE_MODE === 'backend' ? 'Live Backend' : 'Mock Demo'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
