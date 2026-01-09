import { useState, useEffect } from 'react';
import { Bell, Search, LogOut, CheckCircle2, XCircle, MessageCircle, Menu } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { getApiUrl } from '../config';

export function TopBar({ user, onLogout, whatsappConnected, onMenuClick }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileSettings, setProfileSettings] = useState(null);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Load profile settings
  useEffect(() => {
    const loadProfileSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('api/settings/profile'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileSettings(data);
        }
      } catch (error) {
        console.error('Error loading profile settings:', error);
      }
    };

    if (user) {
      loadProfileSettings();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadProfileSettings();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const userName = profileSettings?.fullName || user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const userRole = user?.role || 'user';

  // Load unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('api/notifications/unread'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left Section - Menu Button & Search */}
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-[#718096]" />
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#718096]" />
          <input
            type="text"
            placeholder="Search leads, campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* WhatsApp Status - Hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200">
          <MessageCircle className={`w-4 h-4 ${whatsappConnected ? 'text-green-600' : 'text-orange-500'}`} />
          {whatsappConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-500 font-medium">Disconnected</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-[#718096] hover:text-[#2D3748] hover:bg-[#F5F7F9] rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationsDropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* User Menu - Hidden on small screens */}
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-[#2D3748]">{userName}</p>
            <p className="text-xs text-[#718096] capitalize">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#008080] flex items-center justify-center text-white font-semibold">
            {userInitials}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 md:px-4 py-2 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-[#718096]/30 hover:border-red-200"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

