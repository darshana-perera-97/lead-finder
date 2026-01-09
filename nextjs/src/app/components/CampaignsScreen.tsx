import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  status: 'Draft' | 'Running' | 'Completed';
  sentCount: number;
  dateCreated: string;
}

interface CampaignLead {
  id: number;
  businessName: string;
  email: string;
  emailStatus: 'Sent' | 'Opened' | 'Failed' | 'Pending';
  whatsappStatus: 'Sent' | 'Failed' | 'Pending';
}

export function CampaignsScreen() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const campaigns: Campaign[] = [
    { id: 1, name: 'Q1 Tech Outreach', status: 'Running', sentCount: 45, dateCreated: '2025-01-05' },
    { id: 2, name: 'SaaS Discovery Campaign', status: 'Completed', sentCount: 120, dateCreated: '2024-12-20' },
    { id: 3, name: 'West Coast Expansion', status: 'Draft', sentCount: 0, dateCreated: '2026-01-07' },
    { id: 4, name: 'Holiday Follow-up', status: 'Completed', sentCount: 85, dateCreated: '2024-12-15' },
  ];

  const campaignLeads: CampaignLead[] = [
    { id: 1, businessName: 'Tech Solutions Inc', email: 'contact@techsolutions.com', emailStatus: 'Opened', whatsappStatus: 'Sent' },
    { id: 2, businessName: 'Digital Marketing Pro', email: 'info@digitalmarketingpro.com', emailStatus: 'Sent', whatsappStatus: 'Sent' },
    { id: 3, businessName: 'Cloud Services Ltd', email: 'hello@cloudservices.com', emailStatus: 'Opened', whatsappStatus: 'Sent' },
    { id: 4, businessName: 'AI Innovations Group', email: 'contact@aiinnovations.com', emailStatus: 'Failed', whatsappStatus: 'Failed' },
    { id: 5, businessName: 'SaaS Startup Hub', email: 'info@saasstartup.com', emailStatus: 'Sent', whatsappStatus: 'Sent' },
  ];

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-[#718096]/20 text-[#718096]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmailStatusColor = (status: CampaignLead['emailStatus']) => {
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

  const getWhatsAppStatusColor = (status: CampaignLead['whatsappStatus']) => {
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
      <div className="flex-1 p-8">
        <button
          onClick={() => setSelectedCampaign(null)}
          className="flex items-center gap-2 text-[#008080] hover:text-[#006666] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </button>

        <h1 className="text-[#2D3748] mb-6">{selectedCampaign.name}</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Business Name</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Email</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Email Status</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">WhatsApp Status</th>
                </tr>
              </thead>
              <tbody>
                {campaignLeads.map((lead, index) => (
                  <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                    <td className="px-6 py-4 text-sm text-[#2D3748]">{lead.businessName}</td>
                    <td className="px-6 py-4 text-sm text-[#718096]">{lead.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getEmailStatusColor(lead.emailStatus)}>
                        {lead.emailStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getWhatsAppStatusColor(lead.whatsappStatus)}>
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

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#2D3748]">Campaigns</h1>
        <button className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Campaign Name</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Status</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Sent Count</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Date Created</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                  <td className="px-6 py-4 text-sm text-[#2D3748]">{campaign.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#718096]">{campaign.sentCount}</td>
                  <td className="px-6 py-4 text-sm text-[#718096]">{campaign.dateCreated}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="text-[#008080] hover:text-[#006666] text-sm hover:underline"
                    >
                      View Details
                    </button>
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
