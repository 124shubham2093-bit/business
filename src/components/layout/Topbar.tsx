import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, ChevronDown, User, LogOut, CircleAlert } from 'lucide-react';
import { MockInvestigationService } from '../../services/investigation/MockInvestigationService';
import type { Notification, User as UserType } from '../../services/investigation/investigationTypes';

interface TopbarProps {
  onMenuOpen: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuOpen, searchQuery, setSearchQuery }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>({
    name: 'Sarah Jenkins',
    role: 'Managing Director, Ventures',
    email: 'sarah.j@investiq.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    MockInvestigationService.getCurrentUser().then(setCurrentUser);
    MockInvestigationService.getNotifications().then(setNotifications);
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
    <header className="flex items-center justify-between h-16 px-6 border-b border-white/5 bg-dark-bg/40 backdrop-blur-md sticky top-0 z-30">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center flex-1 space-x-4">
        <button
          onClick={onMenuOpen}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startup investigations, sectors, or scores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/5 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
          />
        </div>
      </div>

      {/* Action Items: Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white ring-2 ring-dark-bg">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel border border-white/10 shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand-purple-light hover:text-brand-purple hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-xs text-gray-400 hover:text-white hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <CircleAlert className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-xs text-gray-400">All caught up! No notifications.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 transition-colors hover:bg-white/5 ${
                        !notif.read ? 'bg-brand-purple/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div
                          className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            !notif.read ? 'bg-brand-purple' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-300">{notif.text}</p>
                          <span className="text-[10px] text-gray-500">{notif.timestamp}</span>
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
        <div className="h-6 w-px bg-white/10" />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-brand-purple/30 object-cover"
            />
            <span className="hidden sm:block text-sm font-medium text-gray-200">
              {currentUser.name}
            </span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel border border-white/10 shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 bg-white/2">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 rounded-md">
                  {currentUser.role}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={() => alert('Settings is a mock link')}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => alert('Logout is mock behavior')}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
