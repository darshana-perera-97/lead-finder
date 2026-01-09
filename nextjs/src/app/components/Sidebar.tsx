import { Search, Database, Megaphone, Link, Settings, User } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'lead-finder', label: 'Lead Finder', icon: Search },
    { id: 'my-leads', label: 'My Leads', icon: Database },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'link-accounts', label: 'Link Accounts', icon: Link },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#F5F7F9] flex flex-col border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-[#008080] text-2xl font-bold">LeadFlow</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
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
          <div className="w-10 h-10 rounded-full bg-[#008080] flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#2D3748]">John Doe</p>
            <p className="text-xs text-[#718096]">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
