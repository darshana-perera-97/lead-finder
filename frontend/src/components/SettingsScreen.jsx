import { useState, useEffect } from 'react';
import { User, Lock, Bell, Save } from 'lucide-react';

export function SettingsScreen() {
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [company, setCompany] = useState('LeadFlow Inc');
  // const [currentPassword, setCurrentPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile settings on mount
  useEffect(() => {
    const loadProfileSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4001/api/settings/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFullName(data.fullName || 'John Doe');
          setEmail(data.email || 'john@example.com');
          setCompany(data.company || 'LeadFlow Inc');
          setEmailNotifications(data.emailNotifications !== undefined ? data.emailNotifications : true);
          setCampaignUpdates(data.campaignUpdates !== undefined ? data.campaignUpdates : true);
          setWeeklyReports(data.weeklyReports !== undefined ? data.weeklyReports : false);
        }
      } catch (error) {
        console.error('Error loading profile settings:', error);
      }
    };

    loadProfileSettings();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/settings/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          company,
          emailNotifications,
          campaignUpdates,
          weeklyReports
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Profile updated successfully!');
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // const handleChangePassword = async () => {
  //   if (newPassword !== confirmPassword) {
  //     alert('Passwords do not match!');
  //     return;
  //   }
  //   if (!currentPassword || !newPassword) {
  //     alert('Please fill in all password fields');
  //     return;
  //   }

  //   setSaving(true);
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await fetch('http://localhost:4001/api/settings/password', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         currentPassword,
  //         newPassword
  //       })
  //     });

  //     const data = await response.json();
      
  //     if (response.ok) {
  //       alert('Password changed successfully!');
  //       setCurrentPassword('');
  //       setNewPassword('');
  //       setConfirmPassword('');
  //     } else {
  //       alert(data.error || 'Failed to change password');
  //     }
  //   } catch (error) {
  //     console.error('Error changing password:', error);
  //     alert('Failed to change password. Please try again.');
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/settings/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          company,
          emailNotifications,
          campaignUpdates,
          weeklyReports
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Notification preferences saved!');
      } else {
        alert(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <h1 className="text-[#2D3748] mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#008080]" />
            </div>
            <h2 className="text-[#2D3748]">Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-[#718096] mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Password Settings - Commented out for now */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#008080]" />
            </div>
            <h2 className="text-[#2D3748]">Change Password</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-[#718096] mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div> */}

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#008080]" />
            </div>
            <h2 className="text-[#2D3748]">Notification Preferences</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2D3748]">Email Notifications</p>
                <p className="text-xs text-[#718096]">Receive email notifications for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#718096]/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#008080] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2D3748]">Campaign Updates</p>
                <p className="text-xs text-[#718096]">Get notified when campaigns complete or have issues</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaignUpdates}
                  onChange={(e) => setCampaignUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#718096]/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#008080] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2D3748]">Weekly Reports</p>
                <p className="text-xs text-[#718096]">Receive weekly performance summary reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyReports}
                  onChange={(e) => setWeeklyReports(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#718096]/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#008080] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveNotifications}
            disabled={saving}
            className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

