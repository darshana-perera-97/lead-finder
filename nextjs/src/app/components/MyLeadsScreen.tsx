import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface Lead {
  id: number;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

export function MyLeadsScreen() {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const savedLeads: Lead[] = [
    {
      id: 1,
      businessName: 'Tech Solutions Inc',
      phone: '+1 (555) 123-4567',
      email: 'contact@techsolutions.com',
      address: '123 Tech Street, San Francisco, CA 94105',
      website: 'www.techsolutions.com'
    },
    {
      id: 2,
      businessName: 'Digital Marketing Pro',
      phone: '+1 (555) 234-5678',
      email: 'info@digitalmarketingpro.com',
      address: '456 Marketing Ave, New York, NY 10001',
      website: 'www.digitalmarketingpro.com'
    },
    {
      id: 3,
      businessName: 'Cloud Services Ltd',
      phone: '+1 (555) 345-6789',
      email: 'hello@cloudservices.com',
      address: '789 Cloud Blvd, Austin, TX 78701',
      website: 'www.cloudservices.com'
    },
    {
      id: 4,
      businessName: 'AI Innovations Group',
      phone: '+1 (555) 456-7890',
      email: 'contact@aiinnovations.com',
      address: '321 Innovation Drive, Seattle, WA 98101',
      website: 'www.aiinnovations.com'
    },
    {
      id: 5,
      businessName: 'SaaS Startup Hub',
      phone: '+1 (555) 567-8901',
      email: 'info@saasstartup.com',
      address: '654 Startup Lane, Boston, MA 02108',
      website: 'www.saasstartup.com'
    },
    {
      id: 6,
      businessName: 'E-commerce Experts',
      phone: '+1 (555) 678-9012',
      email: 'support@ecommerceexperts.com',
      address: '987 Commerce Road, Chicago, IL 60601',
      website: 'www.ecommerceexperts.com'
    },
    {
      id: 7,
      businessName: 'Mobile App Studios',
      phone: '+1 (555) 789-0123',
      email: 'hello@mobileappstudios.com',
      address: '246 Mobile Way, Los Angeles, CA 90001',
      website: 'www.mobileappstudios.com'
    }
  ];

  const toggleLead = (leadId: number) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleAll = () => {
    if (selectedLeads.length === savedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(savedLeads.map((lead) => lead.id));
    }
  };

  const handleCreateCampaign = () => {
    alert(`Creating campaign with ${selectedLeads.length} selected leads!`);
  };

  const handleDeleteLead = (leadId: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      alert(`Lead ${leadId} deleted!`);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#2D3748]">Saved Leads Database</h1>
        {selectedLeads.length > 0 && (
          <button
            onClick={handleCreateCampaign}
            className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors"
          >
            Create Campaign with Selected ({selectedLeads.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === savedLeads.length}
                    onChange={toggleAll}
                    className="w-4 h-4 text-[#008080] border-[#718096] rounded focus:ring-[#008080] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Business Name</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Phone</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Email</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Address</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Website</th>
                <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedLeads.map((lead, index) => (
                <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleLead(lead.id)}
                      className="w-4 h-4 text-[#008080] border-[#718096] rounded focus:ring-[#008080] cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2D3748]">{lead.businessName}</td>
                  <td className="px-6 py-4 text-sm text-[#718096]">{lead.phone}</td>
                  <td className="px-6 py-4 text-sm text-[#718096]">{lead.email}</td>
                  <td className="px-6 py-4 text-sm text-[#718096]">{lead.address}</td>
                  <td className="px-6 py-4 text-sm text-[#008080] hover:underline">
                    <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer">
                      {lead.website}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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
