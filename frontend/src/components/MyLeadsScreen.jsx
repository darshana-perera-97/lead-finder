import { useState, useEffect, useMemo } from 'react';
import { Trash2, Loader2, Search, X, MessageSquare, Mail } from 'lucide-react';
import { Pagination } from './Pagination';
import { getApiUrl, getImageUrl } from '../config';

export function MyLeadsScreen() {
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [savedLeads, setSavedLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // Store all leads for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'whatsapp',
    templateId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Build option lists from saved leads for quick selection
  const industryOptions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(allLeads)) {
      allLeads.forEach(lead => {
        if (lead && lead.industry) set.add(lead.industry);
      });
    }
    return Array.from(set);
  }, [allLeads]);

  const cityOptions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(allLeads)) {
      allLeads.forEach(lead => {
        if (lead && lead.city) set.add(lead.city);
      });
    }
    return Array.from(set);
  }, [allLeads]);

  const countryOptions = useMemo(() => {
    const set = new Set(['Sri Lanka']);
    if (Array.isArray(allLeads)) {
      allLeads.forEach(lead => {
        if (lead && lead.country) set.add(lead.country);
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allLeads]);

  // Fetch saved leads from API
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('api/leads'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array
          const leadsArray = Array.isArray(data) ? data : [];
          setAllLeads(leadsArray); // Store all leads
          setSavedLeads(leadsArray); // Initially show all leads
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load leads');
          // Set empty arrays on error
          setAllLeads([]);
          setSavedLeads([]);
        }
      } catch (error) {
        console.error('Error loading leads:', error);
        setError('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  // Load templates when campaign modal opens
  useEffect(() => {
    if (showCampaignModal) {
      const loadTemplates = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(getApiUrl('api/templates'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setTemplates(data);
          }
        } catch (error) {
          console.error('Error loading templates:', error);
        }
      };

      loadTemplates();
    }
  }, [showCampaignModal]);

  const toggleLead = (leadId) => {
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

  // Filter leads based on search criteria
  const handleFilter = () => {
    if (!Array.isArray(allLeads)) {
      setSavedLeads([]);
      return;
    }
    let filtered = [...allLeads];

    // Filter by industry (case-insensitive partial match)
    if (industry.trim()) {
      filtered = filtered.filter(lead => 
        lead.industry && lead.industry.toLowerCase().includes(industry.toLowerCase().trim())
      );
    }

    // Filter by city (case-insensitive partial match)
    if (city.trim()) {
      filtered = filtered.filter(lead => 
        lead.city && lead.city.toLowerCase().includes(city.toLowerCase().trim())
      );
    }

    // Filter by country (exact match)
    if (country && country !== 'Sri Lanka') {
      filtered = filtered.filter(lead => 
        lead.country && lead.country.toLowerCase() === country.toLowerCase()
      );
    }

    setSavedLeads(filtered);
    setSelectedLeads([]); // Clear selections when filtering
  };

  // Clear filters and show all leads
  const handleClearFilter = () => {
    setIndustry('');
    setCity('');
    setCountry('Sri Lanka');
    setSavedLeads(allLeads);
    setSelectedLeads([]);
  };

  // Live filter whenever criteria change
  useEffect(() => {
    handleFilter();
    setCurrentPage(1); // Reset to first page when filters change
  }, [industry, city, country, allLeads]);

  // Pagination logic
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return savedLeads.slice(startIndex, endIndex);
  }, [savedLeads, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(savedLeads.length / itemsPerPage);

  const handleCreateCampaign = () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead to create a campaign');
      return;
    }
    setCampaignForm({
      name: '',
      type: 'whatsapp',
      templateId: ''
    });
    setShowCampaignModal(true);
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    
    if (!campaignForm.name || !campaignForm.templateId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/campaigns'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: campaignForm.name,
          type: campaignForm.type,
          templateId: campaignForm.templateId,
          leadIds: selectedLeads
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Campaign "${data.name}" created successfully!`);
        setShowCampaignModal(false);
        setSelectedLeads([]);
        setCampaignForm({
          name: '',
          type: 'whatsapp',
          templateId: ''
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to send this campaign?')) {
      return;
    }

    try {
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
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => template.type === campaignForm.type);
  }, [templates, campaignForm.type]);

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`api/leads/${leadId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove lead from both allLeads and savedLeads
        setAllLeads(prevLeads => Array.isArray(prevLeads) ? prevLeads.filter(lead => lead.id !== leadId) : []);
        setSavedLeads(prevLeads => Array.isArray(prevLeads) ? prevLeads.filter(lead => lead.id !== leadId) : []);
        // Remove from selected leads if it was selected
        setSelectedLeads(prev => prev.filter(id => id !== leadId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead. Please try again.');
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-[#2D3748]">Saved Leads Database</h2>
        {selectedLeads.length > 0 && (
          <button
            onClick={handleCreateCampaign}
            className="w-full sm:w-auto bg-[#008080] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors text-sm sm:text-base"
          >
            Create Campaign with Selected ({selectedLeads.length})
          </button>
        )}
      </div>

      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Filter Leads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#718096] mb-2">Industry/Keyword</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              list="industry-options"
              placeholder="e.g., Software, Marketing"
              className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
            <datalist id="industry-options">
              {industryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm text-[#718096] mb-2">City/Location</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="city-options"
              placeholder="e.g., San Francisco"
              className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
            <datalist id="city-options">
              {cityOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm text-[#718096] mb-2">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              {countryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleFilter}
            className="w-full sm:w-auto bg-[#008080] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            Filter Leads
          </button>
          <button
            onClick={handleClearFilter}
            className="w-full sm:w-auto bg-gray-200 text-[#2D3748] px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#008080] animate-spin mx-auto mb-4" />
          <p className="text-[#718096]">Loading leads...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : savedLeads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-[#718096]">
            {(!Array.isArray(allLeads) || allLeads.length === 0)
              ? 'No saved leads yet. Start searching and save leads to see them here!'
              : 'No leads match your filter criteria. Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <>
          {Array.isArray(allLeads) && allLeads.length !== savedLeads.length && (
            <div className="mb-4 text-sm text-[#718096]">
              Showing {savedLeads.length} of {allLeads.length} leads
            </div>
          )}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto mx-2 sm:mx-4 md:mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="w-full min-w-[600px] sm:min-w-[800px]">
            <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
              <tr>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left">
                  <input
                    type="checkbox"
                      checked={savedLeads.length > 0 && selectedLeads.length === savedLeads.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#008080] border-[#718096] rounded focus:ring-[#008080] cursor-pointer"
                  />
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Business Name</th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap hidden sm:table-cell">Phone</th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Email</th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap hidden lg:table-cell">Address</th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap hidden md:table-cell">Website</th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm text-[#2D3748] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
                {paginatedLeads.map((lead, index) => (
                <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleLead(lead.id)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#008080] border-[#718096] rounded focus:ring-[#008080] cursor-pointer"
                    />
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#2D3748] font-medium max-w-[120px] sm:max-w-none truncate sm:truncate-none">{lead.businessName}</td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] hidden sm:table-cell whitespace-nowrap">{lead.phone}</td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] break-all max-w-[150px] sm:max-w-none">{lead.email}</td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] hidden lg:table-cell max-w-[200px] truncate">{lead.address}</td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#008080] hover:underline hidden md:table-cell">
                      {lead.website && lead.website !== 'N/A' ? (
                        <a 
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="break-all max-w-[150px] inline-block truncate"
                          title={lead.website}
                        >
                      {lead.website}
                    </a>
                      ) : (
                        <span className="text-[#718096]">N/A</span>
                      )}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4">
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 sm:p-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
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
          totalItems={savedLeads.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />
        </>
      )}

      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2D3748]">Create Campaign</h2>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <form onSubmit={handleCampaignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#718096] mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                  placeholder="e.g., Q1 Marketing Campaign"
                />
              </div>

              <div>
                <label className="block text-sm text-[#718096] mb-2">Campaign Type</label>
                <select
                  value={campaignForm.type}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, type: e.target.value, templateId: '' }))}
                  required
                  className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#718096] mb-2">Select Template</label>
                {filteredTemplates.length === 0 ? (
                  <div className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg bg-gray-50 text-[#718096]">
                    No {campaignForm.type} templates available. Please create a template first.
                  </div>
                ) : (
                  <select
                    value={campaignForm.templateId}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, templateId: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                  >
                    <option value="">Select a template...</option>
                    {filteredTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {campaignForm.templateId && (() => {
                const selectedTemplate = filteredTemplates.find(t => t.id === campaignForm.templateId);
                return selectedTemplate ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#2D3748] mb-2">Template Preview:</h4>
                    {selectedTemplate.type === 'email' && selectedTemplate.subject && (
                      <div className="mb-2">
                        <p className="text-xs text-[#718096]">Subject:</p>
                        <p className="text-sm text-[#2D3748]">{selectedTemplate.subject}</p>
                      </div>
                    )}
                    <p className="text-sm text-[#718096] whitespace-pre-wrap">{selectedTemplate.message}</p>
                    {selectedTemplate.image && (
                      <div className="mt-2">
                        <img 
                          src={getImageUrl(selectedTemplate.image)} 
                          alt="Template" 
                          className="max-w-full h-32 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Selected Leads:</strong> {selectedLeads.length} lead(s) will receive this campaign
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 bg-gray-200 text-[#2D3748] px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

