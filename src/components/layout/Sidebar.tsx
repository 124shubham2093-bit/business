import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BarChart3, ShieldAlert, X, Sparkles, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('http://localhost:8000/health', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 20000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'New Investigation', path: '/new-investigation', icon: Sparkles },
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Investigations', path: '/investigations', icon: Briefcase },
    { name: 'Portfolio Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Knowledge Graph Verification', path: '/cognee-verify', icon: ShieldCheck },
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] backdrop-blur-md transition-all duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-bold tracking-wider text-[var(--text-primary)] font-display">INVESTIQ</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'border-l-4 border-l-indigo-600 dark:border-l-2 dark:border-l-indigo-500 bg-indigo-100 dark:bg-[var(--bg-subtle)] text-slate-950 dark:text-white font-bold dark:font-semibold shadow-sm'
                    : 'border-l-2 border-l-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <div className="flex items-center justify-between px-2 text-xs text-[var(--text-secondary)]">
            <span className="font-mono text-[11px]">Diligence v1.2</span>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
                backendStatus === 'checking' ? 'bg-slate-400 animate-pulse' : 'bg-amber-500'
              }`}></span>
              <span className={`${
                backendStatus === 'online' ? 'text-emerald-600 dark:text-emerald-400' :
                backendStatus === 'checking' ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'
              } font-medium text-[10px]`}>
                {backendStatus === 'online' ? 'Live Backend' : 
                 backendStatus === 'checking' ? 'Checking...' : 'Local Demo Mode'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
