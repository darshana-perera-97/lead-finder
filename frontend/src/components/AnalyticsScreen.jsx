import { useState, useEffect } from 'react';
import { Search, Database, Megaphone, Mail, MessageSquare, Loader2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getApiUrl } from '../config';

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    loadAnalytics();
    loadCampaigns();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/analytics'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/campaigns'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by date (newest first) and limit to last 10
        const sortedCampaigns = data
          .sort((a, b) => new Date(b.createdAt || b.sentAt || 0) - new Date(a.createdAt || a.sentAt || 0))
          .slice(0, 10);
        setCampaigns(sortedCampaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-[#718096]/20 text-[#718096]';
      case 'Scheduled':
        return 'bg-orange-100 text-orange-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#008080] animate-spin mx-auto mb-4" />
          <p className="text-[#718096]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Format chart data - show last 30 days
  const chartData = analytics.dailySends || [];

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#2D3748]">Analytics</h2>
        <p className="text-sm text-[#718096] mt-1">Track your lead generation and campaign performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#718096] mb-1">Total Searches</p>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.searches || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#718096] mb-1">Saved Leads</p>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.savedLeads || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#718096] mb-1">Total Campaigns</p>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.totalCampaigns || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Megaphone className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#718096] mb-1">Messages Sent</p>
              <p className="text-3xl font-bold text-[#2D3748]">{analytics.totalSent || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-[#2D3748]">Email Messages</p>
          </div>
          <p className="text-2xl font-bold text-[#2D3748]">
            {chartData.reduce((sum, day) => sum + (day.email || 0), 0)}
          </p>
          <p className="text-xs text-[#718096] mt-1">Total emails sent (last 30 days)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-[#2D3748]">WhatsApp Messages</p>
          </div>
          <p className="text-2xl font-bold text-[#2D3748]">
            {chartData.reduce((sum, day) => sum + (day.whatsapp || 0), 0)}
          </p>
          <p className="text-xs text-[#718096] mt-1">Total WhatsApp messages sent (last 30 days)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-[#2D3748]">Failed Messages</p>
          </div>
          <p className="text-2xl font-bold text-[#2D3748]">{analytics.totalFailed || 0}</p>
          <p className="text-xs text-[#718096] mt-1">Total failed message deliveries</p>
        </div>
      </div>

      {/* Daily Message Sends Chart and Campaign History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Left Side - Line Graph */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">Daily Message Sends</h3>
            <p className="text-xs sm:text-sm text-[#718096]">Email and WhatsApp messages sent over the last 30 days</p>
          </div>
          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ 
                  top: 5, 
                  right: windowWidth < 640 ? 5 : windowWidth < 1024 ? 15 : 30, 
                  left: windowWidth < 640 ? 5 : windowWidth < 1024 ? 10 : 20, 
                  bottom: windowWidth < 640 ? 40 : windowWidth < 1024 ? 30 : 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#718096"
                  tick={{ fontSize: windowWidth < 640 ? 10 : windowWidth < 1024 ? 11 : 12 }}
                  angle={windowWidth < 640 ? -45 : 0}
                  textAnchor={windowWidth < 640 ? 'end' : 'middle'}
                  height={windowWidth < 640 ? 60 : windowWidth < 1024 ? 40 : 30}
                  interval={windowWidth < 640 ? 'preserveStartEnd' : 0}
                  tickFormatter={(value) => {
                    try {
                      const date = new Date(value + 'T00:00:00');
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis 
                  stroke="#718096"
                  tick={{ fontSize: windowWidth < 640 ? 10 : windowWidth < 1024 ? 11 : 12 }}
                  width={windowWidth < 640 ? 35 : windowWidth < 1024 ? 40 : 50}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: windowWidth < 640 ? '11px' : '12px',
                    padding: windowWidth < 640 ? '6px' : '8px'
                  }}
                  labelFormatter={(value) => {
                    try {
                      const date = new Date(value + 'T00:00:00');
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    } catch {
                      return value;
                    }
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: windowWidth < 640 ? '11px' : '12px',
                    paddingTop: windowWidth < 640 ? '8px' : '10px'
                  }}
                  iconSize={windowWidth < 640 ? 12 : 14}
                />
                <Line 
                  type="monotone" 
                  dataKey="email" 
                  stroke="#3B82F6" 
                  strokeWidth={windowWidth < 640 ? 1.5 : 2}
                  name="Email"
                  dot={{ r: windowWidth < 640 ? 2 : windowWidth < 1024 ? 3 : 4 }}
                  activeDot={{ r: windowWidth < 640 ? 4 : windowWidth < 1024 ? 5 : 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="whatsapp" 
                  stroke="#10B981" 
                  strokeWidth={windowWidth < 640 ? 1.5 : 2}
                  name="WhatsApp"
                  dot={{ r: windowWidth < 640 ? 2 : windowWidth < 1024 ? 3 : 4 }}
                  activeDot={{ r: windowWidth < 640 ? 4 : windowWidth < 1024 ? 5 : 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side - Campaign History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#2D3748] mb-1">Recent Campaigns</h3>
            <p className="text-sm text-[#718096]">Last 10 campaigns history</p>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#718096]">No campaigns yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto mx-2 sm:mx-4 md:mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="w-full min-w-[400px] sm:min-w-[600px]">
                <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-[#2D3748] whitespace-nowrap">Campaign</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-[#2D3748] whitespace-nowrap">Type</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-[#2D3748] whitespace-nowrap">Status</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-[#2D3748] whitespace-nowrap hidden md:table-cell">Date</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-[#2D3748] whitespace-nowrap">Sent</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-[#2D3748] whitespace-nowrap">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, index) => (
                    <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#2D3748] font-medium max-w-[100px] sm:max-w-none truncate sm:truncate-none">{campaign.name}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs whitespace-nowrap ${
                          campaign.type === 'whatsapp' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs whitespace-nowrap ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-[#718096] hidden md:table-cell whitespace-nowrap">{formatDate(campaign.createdAt || campaign.sentAt)}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-green-600 font-medium">{campaign.sentCount || 0}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-red-600 font-medium">{campaign.failedCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

