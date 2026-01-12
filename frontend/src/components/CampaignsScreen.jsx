import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Send, Loader2, Trash2, Clock, X } from 'lucide-react';
import { Pagination } from './Pagination';
import { getApiUrl } from '../config';

export function CampaignsScreen() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingCampaignId, setSendingCampaignId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCampaignForSchedule, setSelectedCampaignForSchedule] = useState(null);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [schedulingCampaignId, setSchedulingCampaignId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Load campaigns from API on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Set up auto-refresh for live campaigns
  useEffect(() => {
    // Check if campaigns is an array and has any Live or Scheduled campaigns
    if (!Array.isArray(campaigns)) {
      return;
    }
    
    const hasLiveCampaigns = campaigns.some(c => c && (c.status === 'Live' || c.status === 'Scheduled'));
    
    if (!hasLiveCampaigns) {
      return; // Don't set up interval if no live campaigns
    }
    
    // Set up auto-refresh every 3 seconds when there are live campaigns
    const interval = setInterval(() => {
      loadCampaigns(true); // Silent refresh (don't show loading spinner)
    }, 3000); // Refresh every 3 seconds
    
    return () => clearInterval(interval);
  }, [campaigns]); // Re-run effect when campaigns change

  const loadCampaigns = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/campaigns'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        const campaignsArray = Array.isArray(data) ? data : [];
        setCampaigns(campaignsArray);
        if (!silent) {
          setCurrentPage(1); // Reset to first page when campaigns are loaded initially
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load campaigns');
        // Set empty array on error
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to send this campaign?')) {
      return;
    }

    try {
      setSendingCampaignId(campaignId);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`api/campaigns/${campaignId}/send`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Campaign sent successfully!');
        await loadCampaigns(); // Reload campaigns to update status
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setSendingCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`api/campaigns/${campaignId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadCampaigns();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleScheduleCampaign = (campaign) => {
    setSelectedCampaignForSchedule(campaign);
    setShowScheduleModal(true);
    
    // Set default datetime to 1 hour from now in Sri Lankan time
    const now = new Date();
    // Get current time in Sri Lankan timezone
    const sriLankanTimeString = now.toLocaleString('en-US', { 
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Parse the Sri Lankan time string (format: MM/DD/YYYY, HH:MM)
    const [datePart, timePart] = sriLankanTimeString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    
    // Create a date object in Sri Lankan timezone
    const sriLankanDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
    // Add 1 hour
    sriLankanDate.setHours(sriLankanDate.getHours() + 1);
    
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const formattedYear = sriLankanDate.getFullYear();
    const formattedMonth = String(sriLankanDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(sriLankanDate.getDate()).padStart(2, '0');
    const formattedHours = String(sriLankanDate.getHours()).padStart(2, '0');
    const formattedMinutes = String(sriLankanDate.getMinutes()).padStart(2, '0');
    
    const defaultDateTime = `${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`;
    setScheduleDateTime(defaultDateTime);
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleDateTime || !selectedCampaignForSchedule) {
      return;
    }

    try {
      setSchedulingCampaignId(selectedCampaignForSchedule.id);
      const token = localStorage.getItem('token');
      
      // Convert the datetime-local value to Sri Lankan timezone
      // The datetime-local input gives us a value that we interpret as Sri Lankan time
      const [datePart, timePart] = scheduleDateTime.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      
      // Create a date string in Sri Lankan timezone (Asia/Colombo)
      // Format: YYYY-MM-DDTHH:mm:ss+05:30 (Sri Lankan time is UTC+5:30)
      const sriLankanDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:00+05:30`;
      
      // Send the datetime string - backend will parse it correctly
      const response = await fetch(getApiUrl(`api/campaigns/${selectedCampaignForSchedule.id}/schedule`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scheduledAt: sriLankanDateTimeString
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Campaign scheduled successfully!');
        setShowScheduleModal(false);
        setSelectedCampaignForSchedule(null);
        setScheduleDateTime('');
        await loadCampaigns(); // Reload campaigns to update status
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to schedule campaign');
      }
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      alert('Failed to schedule campaign. Please try again.');
    } finally {
      setSchedulingCampaignId(null);
    }
  };

  const campaignLeads = [
    { id: 1, businessName: 'Tech Solutions Inc', email: 'contact@techsolutions.com', emailStatus: 'Opened', whatsappStatus: 'Sent' },
    { id: 2, businessName: 'Digital Marketing Pro', email: 'info@digitalmarketingpro.com', emailStatus: 'Sent', whatsappStatus: 'Sent' },
    { id: 3, businessName: 'Cloud Services Ltd', email: 'hello@cloudservices.com', emailStatus: 'Opened', whatsappStatus: 'Sent' },
    { id: 4, businessName: 'AI Innovations Group', email: 'contact@aiinnovations.com', emailStatus: 'Failed', whatsappStatus: 'Failed' },
    { id: 5, businessName: 'SaaS Startup Hub', email: 'info@saasstartup.com', emailStatus: 'Sent', whatsappStatus: 'Sent' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-[#718096]/20 text-[#718096]';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmailStatusColor = (status) => {
    switch (status) {
      case 'Opened':
        return 'text-green-600';
      case 'Sent':
        return 'text-blue-600';
      case 'Failed':
        return 'text-red-600';
      default:
        return 'text-[#718096]';
    }
  };

  const getWhatsAppStatusColor = (status) => {
    switch (status) {
      case 'Sent':
        return 'text-green-600';
      case 'Failed':
        return 'text-red-600';
      default:
        return 'text-[#718096]';
    }
  };

  if (selectedCampaign) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <button
          onClick={() => setSelectedCampaign(null)}
          className="flex items-center gap-2 text-[#008080] hover:text-[#006666] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </button>

        <h1 className="text-[#2D3748] mb-6">{selectedCampaign.name}</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto mx-2 sm:mx-4 md:mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full min-w-[500px] sm:min-w-[640px]">
              <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
                <tr>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Business Name</th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Email</th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Email Status</th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">WhatsApp Status</th>
                </tr>
              </thead>
              <tbody>
                {campaignLeads.map((lead, index) => (
                  <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#2D3748] font-medium max-w-[120px] sm:max-w-none truncate sm:truncate-none">{lead.businessName}</td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] break-all max-w-[150px] sm:max-w-none">{lead.email}</td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                      <span className={`whitespace-nowrap ${getEmailStatusColor(lead.emailStatus)}`}>
                        {lead.emailStatus}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                      <span className={`whitespace-nowrap ${getWhatsAppStatusColor(lead.whatsappStatus)}`}>
                        {lead.whatsappStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Pagination logic
  const paginatedCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) {
      return [];
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return campaigns.slice(startIndex, endIndex);
  }, [campaigns, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((Array.isArray(campaigns) ? campaigns.length : 0) / itemsPerPage);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#008080] animate-spin mx-auto mb-4" />
          <p className="text-[#718096]">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-[#2D3748]">Campaigns</h2>
        <p className="text-sm text-[#718096]">
          Go to "My Leads" to create a new campaign
        </p>
      </div>

      {(!Array.isArray(campaigns) || campaigns.length === 0) ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-[#718096] mb-4">No campaigns yet. Select leads in "My Leads" and create your first campaign!</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto mx-2 sm:mx-4 md:mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="w-full min-w-[600px] sm:min-w-[800px]">
                <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Campaign Name</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Type</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Status</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap hidden sm:table-cell">Leads</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Sent</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap hidden sm:table-cell">Failed</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap hidden lg:table-cell">Date Created</th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedCampaigns) && paginatedCampaigns.map((campaign, index) => (
                    <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#2D3748] font-medium max-w-[120px] sm:max-w-none truncate sm:truncate-none">{campaign.name}</td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs whitespace-nowrap ${
                          campaign.type === 'whatsapp' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4">
                        <span className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-xs whitespace-nowrap ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] hidden sm:table-cell">{campaign.leadIds?.length || 0}</td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-green-600 font-medium">{campaign.sentCount || 0}</td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-red-600 font-medium hidden sm:table-cell">{campaign.failedCount || 0}</td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] hidden lg:table-cell whitespace-nowrap">{formatDate(campaign.createdAt)}</td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3">
                          {campaign.status === 'Draft' && (
                            <>
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                disabled={sendingCampaignId === campaign.id}
                                className="flex items-center gap-0.5 sm:gap-1 text-[#008080] hover:text-[#006666] text-xs sm:text-sm transition-colors disabled:opacity-50 p-1 sm:p-0"
                                title="Send Campaign"
                              >
                                {sendingCampaignId === campaign.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                    <span className="hidden md:inline">Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden md:inline">Send</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleScheduleCampaign(campaign)}
                                disabled={schedulingCampaignId === campaign.id}
                                className="flex items-center gap-0.5 sm:gap-1 text-orange-600 hover:text-orange-700 text-xs sm:text-sm transition-colors disabled:opacity-50 p-1 sm:p-0"
                                title="Schedule Campaign"
                              >
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden md:inline">Send Later</span>
                              </button>
                            </>
                          )}
                          {campaign.status === 'Scheduled' && campaign.scheduledAt && (
                            <span className="text-xs text-orange-600 hidden lg:inline whitespace-nowrap">
                              Scheduled: {new Date(campaign.scheduledAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 sm:p-0"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={Array.isArray(campaigns) ? campaigns.length : 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      {/* Schedule Campaign Modal */}
      {showScheduleModal && selectedCampaignForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#2D3748]">Schedule Campaign</h2>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedCampaignForSchedule(null);
                  setScheduleDateTime('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[#718096] mb-2">
                  Campaign: <span className="font-semibold text-[#2D3748]">{selectedCampaignForSchedule.name}</span>
                </p>
                <p className="text-xs text-[#718096] mb-4">
                  Select a date and time to schedule this campaign (Sri Lankan Time)
                </p>
              </div>

              <div>
                <label className="block text-sm text-[#718096] mb-2">Schedule Date & Time (Sri Lankan Time)</label>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  min={(() => {
                    // Get current time in Sri Lankan timezone and format for min attribute
                    const now = new Date();
                    const sriLankanTimeString = now.toLocaleString('en-US', { 
                      timeZone: 'Asia/Colombo',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    });
                    const [datePart, timePart] = sriLankanTimeString.split(', ');
                    const [month, day, year] = datePart.split('/');
                    const [hours, minutes] = timePart.split(':');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                  })()}
                  className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                />
                <p className="text-xs text-[#718096] mt-1">
                  Current Sri Lankan Time: {new Date().toLocaleString('en-US', { 
                    timeZone: 'Asia/Colombo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The campaign will be sent automatically at the scheduled time. Make sure WhatsApp is connected for WhatsApp campaigns.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDateTime || schedulingCampaignId === selectedCampaignForSchedule.id}
                  className="flex-1 bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {schedulingCampaignId === selectedCampaignForSchedule.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Schedule Campaign
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedCampaignForSchedule(null);
                    setScheduleDateTime('');
                  }}
                  className="flex-1 bg-gray-200 text-[#2D3748] px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

