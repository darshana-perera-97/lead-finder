import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Database, Megaphone, Link, Settings, User, FileText, BarChart3, X } from 'lucide-react';
import { getApiUrl } from '../config';

export function Sidebar({ user, isOpen = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileSettings, setProfileSettings] = useState(null);

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

  const displayName = profileSettings?.fullName || user?.name || 'User';
  const displayEmail = profileSettings?.email || user?.email || '';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const menuItems = [
    { id: 'lead-finder', label: 'Lead Finder', icon: Search },
    { id: 'my-leads', label: 'My Leads', icon: Database },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'link-accounts', label: 'Link Accounts', icon: Link },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-[#F5F7F9] flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-[#008080] text-2xl font-bold">LeadFlow</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#718096]" />
          </button>
        </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === `/dashboard/${item.id}`;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/dashboard/${item.id}`);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-[#008080] text-white'
                  : 'text-[#718096] hover:bg-white hover:text-[#2D3748]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-[#008080] flex items-center justify-center text-white font-semibold">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#2D3748] truncate">{displayName}</p>
            <p className="text-xs text-[#718096] truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

