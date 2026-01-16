import { useState, useEffect } from 'react';
import { Users, Search, Database, Package, Plus, Edit2, LogOut, TrendingUp, BarChart3 } from 'lucide-react';
import { getApiUrl } from '../config';

export function AdminPanel({ user, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    package: 'basic'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load analytics
      const analyticsResponse = await fetch(getApiUrl('api/admin/analytics'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
      
      // Load users
      const usersResponse = await fetch(getApiUrl('api/admin/users'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/admin/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('User created successfully!');
        setShowCreateUser(false);
        setFormData({ email: '', password: '', name: '', package: 'basic' });
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdatePackage = async (userId, packageType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`api/admin/users/${userId}/package`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ package: packageType })
      });

      if (response.ok) {
        alert('Package updated successfully!');
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#718096]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Admin Dashboard</h1>
              <p className="text-sm text-[#718096] mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-[#718096] hover:text-[#2D3748] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.totalUsers}</p>
              <p className="text-sm text-[#718096] mt-1">Total Users</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.totalSearches}</p>
              <p className="text-sm text-[#718096] mt-1">Total Searches</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.totalSavedLeads}</p>
              <p className="text-sm text-[#718096] mt-1">Saved Leads</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.totalCampaigns}</p>
              <p className="text-sm text-[#718096] mt-1">Total Campaigns</p>
            </div>
          </div>
        )}

        {/* Package Distribution */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Package Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">{analytics.packageDistribution.basic}</p>
                <p className="text-sm text-[#718096] mt-1">Basic Plan</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">{analytics.packageDistribution.pro}</p>
                <p className="text-sm text-[#718096] mt-1">Pro Plan</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">{analytics.packageDistribution.lifetime}</p>
                <p className="text-sm text-[#718096] mt-1">Lifetime Plan</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2D3748] flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users Management
            </h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7F9] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">Package</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">Searches Used</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">Total Searches</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D3748]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#2D3748]">{u.id}</td>
                    <td className="px-6 py-4 text-sm text-[#2D3748]">{u.fullName || u.name}</td>
                    <td className="px-6 py-4 text-sm text-[#2D3748]">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.package === 'basic' ? 'bg-blue-100 text-blue-600' :
                        u.package === 'pro' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {u.package?.toUpperCase() || 'BASIC'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2D3748]">{u.searchCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-[#2D3748]">{u.totalSearches || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.package || 'basic'}
                          onChange={(e) => handleUpdatePackage(u.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        >
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-[#2D3748]">Create New User</h3>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Package</label>
                  <select
                    value={formData.package}
                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  >
                    <option value="basic">Basic (5 lifetime searches)</option>
                    <option value="pro">Pro (50 monthly searches)</option>
                    <option value="lifetime">Lifetime (Unlimited)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-[#006666] transition-colors"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUser(false);
                      setFormData({ email: '', password: '', name: '', package: 'basic' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

