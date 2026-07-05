import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronDown, CircleAlert, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { MockInvestigationService } from '../../services/investigation/MockInvestigationService';
import type { Notification, User as UserType } from '../../services/investigation/investigationTypes';

interface TopbarProps {
  onMenuOpen: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>({
    name: 'Sarah Jenkins',
    role: 'Managing Partner',
    email: 'sarah.j@investiq.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    MockInvestigationService.getCurrentUser().then((u) => {
      setCurrentUser({ ...u, role: 'Managing Partner' });
    });
    MockInvestigationService.getNotifications().then(setNotifications);
  }, []);

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

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    MockInvestigationService.markNotificationsAsRead().then(setNotifications);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-[var(--border-color)] bg-[var(--bg-surface)] backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      {/* Mobile Toggle & Left Space */}
      <div className="flex items-center flex-1 space-x-4">
        <button
          onClick={onMenuOpen}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Action Items: Theme Toggle, Notifications & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-600 hover:text-indigo-600 transition-colors" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-[var(--bg-surface)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl backdrop-blur-md overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border-color)]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <CircleAlert className="w-8 h-8 text-[var(--text-secondary)] mb-2 opacity-60" />
                    <p className="text-xs text-[var(--text-secondary)]">All caught up! No notifications.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 transition-colors hover:bg-[var(--bg-hover)] ${
                        !notif.read ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div
                          className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            !notif.read ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-xs text-[var(--text-primary)] font-medium">{notif.text}</p>
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono">{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-[var(--border-color)]" />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-[var(--border-color)] object-cover shadow-sm"
            />
            <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)]">
              {currentUser.name}
            </span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl backdrop-blur-md overflow-hidden z-50 text-xs">
              <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{currentUser.name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-[var(--bg-surface)] text-indigo-600 dark:text-indigo-400 border border-[var(--border-color)] rounded-md font-mono">
                  {currentUser.role}
                </span>
              </div>
              <div className="p-4 space-y-2.5 text-[var(--text-secondary)] font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span>Workspace:</span>
                  <span className="font-semibold text-[var(--text-primary)] font-sans">InvestIQ Demo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Version:</span>
                  <span className="font-semibold text-[var(--text-primary)]">v1.2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Backend Status:</span>
                  <span className={`font-semibold ${
                    backendStatus === 'online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {backendStatus === 'online' ? 'Live Backend' : 'Local Demo Mode'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Theme:</span>
                  <span className="font-semibold text-[var(--text-primary)] font-sans">
                    {theme === 'light' ? 'Light' : 'Dark'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
