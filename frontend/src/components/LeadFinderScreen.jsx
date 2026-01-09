import { useState, useEffect, useMemo } from 'react';
import { Info, Plus, Search, Database, MessageSquare, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Pagination } from './Pagination';
import { getApiUrl } from '../config';

export function LeadFinderScreen({ user }) {
  const [profileSettings, setProfileSettings] = useState(null);
  const [analytics, setAnalytics] = useState({
    searches: 0,
    savedLeads: 0,
    followups: 0
  });

  // Load profile settings
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

  // Load analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('api/analytics'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    if (user) {
      loadAnalytics();
    }
  }, [user]);

  // Load saved leads to check for duplicates
  useEffect(() => {
    const loadSavedLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('api/leads'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSavedLeads(data);
        }
      } catch (error) {
        console.error('Error loading saved leads:', error);
      }
    };

    if (user) {
      loadSavedLeads();
    }
  }, [user]);

  // Check WhatsApp connection status
  useEffect(() => {
    const checkWhatsAppStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('api/whatsapp/status'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWhatsappConnected(data.connected || false);
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
      }
    };

    if (user) {
      checkWhatsAppStatus();
      // Check status every 10 seconds
      const interval = setInterval(checkWhatsAppStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getGreeting();
  const userName = profileSettings?.fullName || user?.name || 'there';
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedLeads, setSavedLeads] = useState([]);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Pagination logic for search results
  const paginatedSearchResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  }, [searchResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const handleSearch = async () => {
    if (!industry && !city) {
      alert('Please enter at least an industry/keyword or city');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowPopup(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/search'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          industry,
          city,
          country
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search leads');
      }

      const data = await response.json();
      
      // Load saved leads to check for duplicates
      let currentSavedLeads = savedLeads;
      if (savedLeads.length === 0) {
        try {
          const savedLeadsResponse = await fetch(getApiUrl('api/leads'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (savedLeadsResponse.ok) {
            currentSavedLeads = await savedLeadsResponse.json();
            setSavedLeads(currentSavedLeads);
          }
        } catch (error) {
          console.error('Error loading saved leads:', error);
        }
      }
      
      // Helper function to normalize strings for comparison
      const normalizeString = (str) => (str || '').toLowerCase().trim();
      const normalizePhone = (str) => (str || '').replace(/[^\d+]/g, '').trim();

      // Transform Serper API response to lead format
      let leads = (data.places || []).map((place, index) => ({
        id: index + 1,
        businessName: place.title || place.name || 'N/A',
        phone: place.phoneNumber || place.phoneNumbers?.[0] || 'N/A',
        email: place.email || place.emails?.[0] || 'N/A',
        address: place.address || place.formattedAddress || 'N/A',
        website: place.website || place.url || 'N/A',
        rating: place.rating || null,
        ratingCount: place.ratingCount || null,
        category: place.category || null
      }));

      // Remove duplicates within search results (by businessName, email, or phone)
      const uniqueLeads = [];
      const seen = new Set();
      
      leads.forEach(lead => {
        const key = `${normalizeString(lead.businessName)}|${normalizeString(lead.email)}|${normalizePhone(lead.phone)}`;
        if (!seen.has(key) && lead.businessName !== 'N/A') {
          seen.add(key);
          uniqueLeads.push(lead);
        }
      });

      // Mark leads that are already saved
      const leadsWithSavedStatus = uniqueLeads.map(lead => {
        const isSaved = currentSavedLeads.some(savedLead => {
          // Check by business name
          if (normalizeString(savedLead.businessName) === normalizeString(lead.businessName)) {
            return true;
          }
          // Check by email
          const savedEmail = normalizeString(savedLead.email);
          const leadEmail = normalizeString(lead.email);
          if (savedEmail !== 'n/a' && leadEmail !== 'n/a' && savedEmail === leadEmail) {
            return true;
          }
          // Check by phone
          const savedPhone = normalizePhone(savedLead.phone);
          const leadPhone = normalizePhone(lead.phone);
          if (savedPhone && leadPhone && savedPhone === leadPhone) {
            return true;
          }
          return false;
        });
        
        return {
          ...lead,
          isSaved
        };
      });

      setSearchResults(leadsWithSavedStatus);
      setHasSearched(true);
      setCurrentPage(1); // Reset to first page when new search is performed
      
      // Refresh analytics after search
      try {
        const analyticsResponse = await fetch(getApiUrl('api/analytics'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search leads. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLead = async (lead) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/leads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: lead.businessName,
          phone: lead.phone,
          email: lead.email,
          address: lead.address,
          website: lead.website,
          industry: industry,
          city: city,
          country: country
        })
      });

      if (response.ok) {
        alert(`Lead "${lead.businessName}" saved to database!`);
        
        // Mark lead as saved in search results
        setSearchResults(prevResults => 
          prevResults.map(result => {
            if (result.id === lead.id) {
              return { ...result, isSaved: true };
            }
            return result;
          })
        );
        
        // Reload saved leads
        const savedLeadsResponse = await fetch(getApiUrl('api/leads'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (savedLeadsResponse.ok) {
          const savedData = await savedLeadsResponse.json();
          setSavedLeads(savedData);
        }
        
        // Refresh analytics
        try {
          const analyticsResponse = await fetch(getApiUrl('api/analytics'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            setAnalytics(analyticsData);
          }
        } catch (error) {
          console.error('Error loading analytics:', error);
        }
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          // Duplicate lead
          alert(errorData.message || 'This lead already exists in your database');
          // Mark as saved in UI
          setSearchResults(prevResults => 
            prevResults.map(result => {
              if (result.id === lead.id) {
                return { ...result, isSaved: true };
              }
              return result;
            })
          );
        } else {
          alert(errorData.error || 'Failed to save lead');
        }
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save lead. Please try again.');
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      {/* Greeting Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#2D3748] mb-2">
          {greeting}, {userName.split(' ')[0]}! 👋
        </h2>
        <p className="text-[#718096]">
          Ready to find some great leads today?
          <span className="ml-3 inline-flex items-center gap-1.5">
            {whatsappConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">WhatsApp Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-500 font-medium">WhatsApp Not Connected</span>
              </>
            )}
          </span>
        </p>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D3748]">{analytics.searches}</p>
          <p className="text-sm text-[#718096] mt-1">No of Searches</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D3748]">{analytics.savedLeads}</p>
          <p className="text-sm text-[#718096] mt-1">Saved Leads</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D3748]">{analytics.followups}</p>
          <p className="text-sm text-[#718096] mt-1">Followups</p>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-[#718096] pt-6">Find New Leads</h2>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <option>Sri Lanka</option>
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
              <option>France</option>
              <option>Italy</option>
              <option>Spain</option>
              <option>Netherlands</option>
              <option>Belgium</option>
              <option>Switzerland</option>
              <option>Austria</option>
              <option>Sweden</option>
              <option>Norway</option>
              <option>Denmark</option>
              <option>Finland</option>
              <option>Ireland</option>
              <option>Portugal</option>
              <option>Poland</option>
              <option>Czech Republic</option>
              <option>Greece</option>
              <option>Romania</option>
              <option>Hungary</option>
              <option>New Zealand</option>
              <option>Japan</option>
              <option>South Korea</option>
              <option>China</option>
              <option>India</option>
              <option>Singapore</option>
              <option>Malaysia</option>
              <option>Thailand</option>
              <option>Philippines</option>
              <option>Indonesia</option>
              <option>Vietnam</option>
              <option>Hong Kong</option>
              <option>Taiwan</option>
              <option>United Arab Emirates</option>
              <option>Saudi Arabia</option>
              <option>Israel</option>
              <option>South Africa</option>
              <option>Brazil</option>
              <option>Mexico</option>
              <option>Argentina</option>
              <option>Chile</option>
              <option>Colombia</option>
              <option>Peru</option>
              <option>Turkey</option>
              <option>Russia</option>
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

      {/* Results Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2D3748]">Search Results</h2>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#008080] animate-spin mb-4" />
                  <p className="text-[#718096]">Searching for leads...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-[#718096]">No leads found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto mx-2 sm:mx-4 md:mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full min-w-[500px] sm:min-w-[640px]">
                    <thead className="bg-[#F5F7F9] border-b border-[#718096]/20">
                      <tr>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[#2D3748] whitespace-nowrap">Business Name</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[#2D3748] whitespace-nowrap hidden sm:table-cell">Contact Number</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[#2D3748] whitespace-nowrap">Email</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[#2D3748] whitespace-nowrap hidden lg:table-cell">Address</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[#2D3748] whitespace-nowrap hidden md:table-cell">Website</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[#2D3748] whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSearchResults.map((lead, index) => (
                        <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7F9]/50'}>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-medium text-[#2D3748] max-w-[120px] sm:max-w-none truncate sm:truncate-none">{lead.businessName}</td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#2D3748] hidden sm:table-cell whitespace-nowrap">
                            {lead.phone !== 'N/A' ? (
                              <a 
                                href={`tel:${lead.phone.replace(/\s/g, '')}`}
                                className="text-[#008080] hover:text-[#006666] hover:underline"
                              >
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-[#718096]">N/A</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#2D3748]">
                            {lead.email !== 'N/A' ? (
                              <a 
                                href={`mailto:${lead.email}`}
                                className="text-[#008080] hover:text-[#006666] hover:underline break-all max-w-[150px] sm:max-w-none inline-block"
                              >
                                {lead.email}
                              </a>
                            ) : (
                              <span className="text-[#718096]">N/A</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#718096] hidden lg:table-cell max-w-[200px] truncate">{lead.address}</td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[#008080] hover:underline hidden md:table-cell">
                            {lead.website !== 'N/A' ? (
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
                            {lead.isSaved ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                                <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden md:inline">Saved</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSaveLead(lead)}
                                className="flex items-center gap-0.5 sm:gap-1 text-[#008080] hover:text-[#006666] transition-colors text-xs sm:text-sm"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Save</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200">
              {searchResults.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={searchResults.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                />
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-[#718096]">
                  Found {searchResults.length} {searchResults.length === 1 ? 'lead' : 'leads'}
                </p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full sm:w-auto bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasSearched && !showPopup && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-[#718096]">Enter search criteria and click "Start Search" to find leads</p>
        </div>
      )}
    </div>
  );
}

