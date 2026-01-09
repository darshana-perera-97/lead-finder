import { useState } from 'react';
import { Info, Plus } from 'lucide-react';

interface Lead {
  id: number;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

export function LeadFinderScreen() {
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const mockLeads: Lead[] = [
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
    }
  ];

  const handleSearch = () => {
    setSearchResults(mockLeads);
    setHasSearched(true);
  };

  const handleSaveLead = (lead: Lead) => {
    alert(`Lead "${lead.businessName}" saved to database!`);
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-[#2D3748] mb-6">Find New Leads</h1>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#718096] mb-2">Select Industry/Keyword</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Software, Marketing"
              className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-[#718096] mb-2">City/Location</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., San Francisco"
              className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-[#718096] mb-2">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="bg-[#008080] text-white px-8 py-3 rounded-lg hover:bg-[#006666] transition-colors"
        >
          Start Search
        </button>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Business Name</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Phone</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">
                    <div className="flex items-center gap-2">
                      Email
                      <div className="relative group">
                        <Info className="w-4 h-4 text-[#718096] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#2D3748] text-white text-xs px-3 py-2 rounded whitespace-nowrap">
                          Emails are extracted from website
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Address</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Website</th>
                  <th className="px-6 py-4 text-left text-sm text-[#2D3748]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((lead, index) => (
                  <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
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
                        onClick={() => handleSaveLead(lead)}
                        className="flex items-center gap-1 text-[#008080] hover:text-[#006666] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Save</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hasSearched && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-[#718096]">Enter search criteria and click "Start Search" to find leads</p>
        </div>
      )}
    </div>
  );
}
