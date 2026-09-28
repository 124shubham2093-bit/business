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
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 20000);
    return () => clearInterval(interval);
  }, []);

  const diligenceItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Investigation', path: '/new-investigation', icon: Sparkles },
    { name: 'Investigations', path: '/investigations', icon: Briefcase },
    { name: 'Decision Center', path: '/decision-center', icon: ShieldAlert },
  ];

  const intelligenceItems = [
    { name: 'Failure Intelligence', path: '/analytics', icon: BarChart3 },
    { name: 'Cognee Verification', path: '/cognee-verify', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] transition-all duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] font-display block leading-none">
                InvestIQ
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium block mt-0.5">
                Startup Intelligence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Section 1: Diligence */}
          <div>
            <span className="px-3 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono block mb-1.5 opacity-75">
              Diligence &amp; Portfolio
            </span>
            <div className="space-y-0.5">
              {diligenceItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors duration-150 ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section 2: Intelligence & Analytics */}
          <div>
            <span className="px-3 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono block mb-1.5 opacity-75">
              Intelligence &amp; Data
            </span>
            <div className="space-y-0.5">
              {intelligenceItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors duration-150 ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <div className="flex items-center justify-between px-1.5 text-xs text-[var(--text-secondary)]">
            <span className="font-mono text-[10px] text-[var(--text-secondary)]">Engine v1.2</span>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
                backendStatus === 'checking' ? 'bg-slate-400' : 'bg-amber-500'
              }`} />
              <span className={`${
                backendStatus === 'online' ? 'text-emerald-700 dark:text-emerald-400' :
                backendStatus === 'checking' ? 'text-slate-500' : 'text-amber-700 dark:text-amber-400'
              } font-medium text-[10px]`}>
                {backendStatus === 'online' ? 'Live API' : 
                 backendStatus === 'checking' ? 'Connecting...' : 'Local Mode'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
