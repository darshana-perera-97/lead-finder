import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Edit2, Eye, X, Loader2, MessageSquare, Mail, Send, Download, ArrowLeft } from 'lucide-react';
import { Pagination } from './Pagination';
import { getApiUrl, getImageUrl } from '../config';

export function TemplatesScreen() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'whatsapp',
    message: '',
    subject: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorPopup, setErrorPopup] = useState(null);
  const [showUseTemplateModal, setShowUseTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contactList, setContactList] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [showSampleCsv, setShowSampleCsv] = useState(false);
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // Message patterns/variants for each platform
  const messagePatterns = {
    whatsapp: [
      {
        name: 'Text Only',
        pattern: 'text-only',
        description: 'Send a simple text message without images',
        hasImage: false,
        hasHeading: false
      },
      {
        name: 'Image Only',
        pattern: 'image-only',
        description: 'Send only an image without text',
        hasImage: true,
        hasHeading: false
      },
      {
        name: 'Image with Text',
        pattern: 'image-text',
        description: 'Send an image with accompanying text message',
        hasImage: true,
        hasHeading: false
      },
      {
        name: 'Heading with Text',
        pattern: 'heading-text',
        description: 'Send a message with a heading and text content',
        hasImage: false,
        hasHeading: true
      },
      {
        name: 'Heading, Image & Text',
        pattern: 'heading-image-text',
        description: 'Send a complete message with heading, image, and text',
        hasImage: true,
        hasHeading: true
      }
    ],
    email: [
      {
        name: 'Normal Text',
        pattern: 'normal-text',
        description: 'Send a simple text email',
        hasImage: false,
        hasHtml: false
      },
      {
        name: 'Image with Text',
        pattern: 'image-text',
        description: 'Send an email with image and text content',
        hasImage: true,
        hasHtml: false
      },
      {
        name: 'HTML Email',
        pattern: 'html-email',
        description: 'Create a rich HTML formatted email',
        hasImage: false,
        hasHtml: true
      }
    ]
  };

  // Fetch templates from API
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('api/templates'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        setCurrentPage(1); // Reset to first page when templates are loaded
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return templates.slice(startIndex, endIndex);
  }, [templates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(templates.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAndSetImage = (file) => {
    try {
      if (!file) {
        return false;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const validExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert('Please drop a JPG or PNG image file.');
        return false;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return false;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      return true;
    } catch (error) {
      console.error('Error handling image:', error);
      alert('Error processing file. Please try again.');
      return false;
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      validateAndSetImage(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on pattern
    if (!formData.name) {
      alert('Template name is required');
      return;
    }

    // Pattern-based validation
    if (formData.pattern) {
      // WhatsApp patterns
      if (formData.type === 'whatsapp') {
        if (formData.pattern === 'image-only') {
          if (!formData.image) {
            alert('Image is required for image-only pattern');
            return;
          }
        } else if (formData.pattern === 'heading-text' || formData.pattern === 'heading-image-text') {
          if (!formData.heading) {
            alert('Heading is required for this pattern');
            return;
          }
          if (!formData.message) {
            alert('Message is required for this pattern');
            return;
          }
        } else if (formData.pattern === 'text-only' || formData.pattern === 'image-text') {
          if (!formData.message) {
            alert('Message is required for this pattern');
            return;
          }
        }
      }
      // Email patterns
      else if (formData.type === 'email') {
        if (!formData.subject) {
          alert('Subject is required for email templates');
          return;
        }
        if (!formData.message) {
          alert('Message is required for this pattern');
          return;
        }
      }
    } else {
      // Fallback for editing existing templates without pattern
      if (!formData.message) {
        alert('Message is required');
        return;
      }
      if (formData.type === 'email' && !formData.subject) {
        alert('Subject is required for email templates');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      
      // Only append message if pattern requires it (not image-only)
      if (formData.pattern !== 'image-only' && formData.message) {
        formDataToSend.append('message', formData.message);
      }
      
      // Append subject for email
      if (formData.type === 'email' && formData.subject) {
        formDataToSend.append('subject', formData.subject);
      }
      
      // Append heading for WhatsApp patterns with heading
      if (formData.type === 'whatsapp' && formData.heading) {
        formDataToSend.append('heading', formData.heading);
      }
      
      // Append pattern
      if (formData.pattern) {
        formDataToSend.append('pattern', formData.pattern);
      }
      
      // Append useHtml for email HTML pattern
      if (formData.useHtml) {
        formDataToSend.append('useHtml', 'true');
      }
      
      // Append image only if pattern supports it and image is provided
      if (formData.image && formData.pattern && (
        formData.pattern === 'image-only' ||
        formData.pattern === 'image-text' ||
        formData.pattern === 'heading-image-text' ||
        (formData.type === 'email' && formData.pattern === 'image-text')
      )) {
        formDataToSend.append('image', formData.image);
      }
      
      // For editing existing templates without pattern, allow image
      if (formData.image && !formData.pattern && editingTemplate) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingTemplate 
        ? getApiUrl(`api/templates/${editingTemplate.id}`)
        : getApiUrl('api/templates');
      
      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        await loadTemplates();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        setErrorPopup({
          title: errorData.error === 'Template limit reached' ? 'Template Limit Reached' : 'Error Saving Template',
          message: errorData.message || errorData.error || 'Failed to save template'
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setErrorPopup({
        title: 'Error',
        message: 'Failed to save template. Please try again.'
      });
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      message: template.message,
      subject: template.subject || '',
      image: null,
      heading: template.heading || '',
      pattern: template.pattern || '',
      useHtml: template.useHtml || false
    });
    setImagePreview(template.image ? getImageUrl(template.image) : null);
    setShowModal(true);
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`api/templates/${templateId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadTemplates();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setShowPlatformSelection(false);
    setShowTemplateSelection(false);
    setSelectedPlatform(null);
    setTemplateName('');
    setFormData({
      name: '',
      type: 'whatsapp',
      message: '',
      subject: '',
      image: null,
      heading: '',
      pattern: '',
      useHtml: false
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setSelectedPlatform(null);
    setTemplateName('');
    setShowPlatformSelection(true);
  };

  const handlePlatformSelect = (platform) => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    setSelectedPlatform(platform);
    setShowPlatformSelection(false);
    setShowTemplateSelection(true);
  };

  const handleTemplateSelect = (pattern) => {
    setFormData({
      name: templateName.trim() || pattern.name,
      type: selectedPlatform,
      message: '',
      subject: selectedPlatform === 'email' ? '' : '',
      image: null,
      heading: pattern.hasHeading ? '' : '',
      pattern: pattern.pattern,
      useHtml: pattern.hasHtml || false
    });
    setImagePreview(null);
    setShowTemplateSelection(false);
    setShowModal(true);
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setContactList('');
    setCampaignName('');
    setCsvFile(null);
    setShowSampleCsv(false);
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
    setShowUseTemplateModal(true);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result;
        if (typeof csvText === 'string') {
          // Parse CSV and extract contacts
          const lines = csvText.split('\n').filter(line => line.trim());
          const contacts = [];
          
          // Skip header row if present
          const startIndex = lines[0]?.toLowerCase().includes('phone') || 
                            lines[0]?.toLowerCase().includes('email') ||
                            lines[0]?.toLowerCase().includes('contact') ? 1 : 0;
          
          for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Split by comma and get first column (or whole line if single column)
            const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
            const contact = columns[0] || line.trim();
            
            if (contact) {
              contacts.push(contact);
            }
          }
          
          if (contacts.length > 0) {
            setContactList(contacts.join('\n'));
          } else {
            alert('No contacts found in CSV file');
            setCsvFile(null);
          }
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error reading CSV file. Please check the format.');
        setCsvFile(null);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file');
      setCsvFile(null);
    };
    
    reader.readAsText(file);
  };

  const parseContactList = (list) => {
    // Split by newlines, commas, or semicolons, then trim and filter empty
    return list
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const downloadSampleCsv = () => {
    if (!selectedTemplate) return;
    
    const header = selectedTemplate.type === 'whatsapp' ? 'Phone Number' : 'Email Address';
    const sampleData = selectedTemplate.type === 'whatsapp' 
      ? ['077 123 4567', '077 234 5678', '077 345 6789']
      : ['email1@example.com', 'email2@example.com', 'email3@example.com'];
    
    const csvContent = [header, ...sampleData].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sample_${selectedTemplate.type}_contacts.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const handleCreateCampaignFromTemplate = async () => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    const contacts = parseContactList(contactList);
    if (contacts.length === 0) {
      alert('Please enter at least one contact');
      return;
    }

    setIsCreatingCampaign(true);

    try {
      const token = localStorage.getItem('token');
      
      // First, create leads from the contact list
      const leadPromises = contacts.map(async (contact) => {
        const leadData = {
          businessName: selectedTemplate.type === 'whatsapp' 
            ? `Contact: ${contact}` 
            : `Email Contact: ${contact}`,
          phone: selectedTemplate.type === 'whatsapp' ? contact : 'N/A',
          email: selectedTemplate.type === 'email' ? contact : 'N/A',
          address: 'N/A',
          website: 'N/A',
          industry: '',
          city: '',
          country: 'Sri Lanka'
        };

          const response = await fetch(getApiUrl('api/leads'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          const data = await response.json();
          return data.id;
        } else if (response.status === 409) {
          // Duplicate lead - try to find existing lead
          const leadsResponse = await fetch(getApiUrl('api/leads'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (leadsResponse.ok) {
            const allLeads = await leadsResponse.json();
            const existingLead = allLeads.find(lead => 
              (selectedTemplate.type === 'whatsapp' && lead.phone === contact) ||
              (selectedTemplate.type === 'email' && lead.email === contact)
            );
            return existingLead?.id;
          }
        }
        return null;
      });

      const leadIds = (await Promise.all(leadPromises)).filter(id => id !== null);

      if (leadIds.length === 0) {
        alert('Failed to create leads. Please check your contact list format.');
        setIsCreatingCampaign(false);
        return;
      }

      // Create campaign with the template and leads
      const campaignResponse = await fetch(getApiUrl('api/campaigns'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: campaignName,
          type: selectedTemplate.type,
          templateId: selectedTemplate.id,
          leadIds: leadIds
        })
      });

      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        alert(`Campaign "${campaignName}" created successfully with ${leadIds.length} contact(s)!`);
        setShowUseTemplateModal(false);
        setContactList('');
        setCampaignName('');
        setSelectedTemplate(null);
        
        // Navigate to campaigns page
        window.dispatchEvent(new CustomEvent('navigateToCampaigns', { detail: 'campaigns' }));
      } else {
        const errorData = await campaignResponse.json();
        alert(errorData.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign from template:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2D3748]">Templates</h2>
          <p className="text-sm text-[#718096] mt-1">
            {templates.length} of 15 templates used
          </p>
        </div>
        <button
          onClick={handleNewTemplate}
          disabled={templates.length >= 15}
          className="w-full sm:w-auto bg-[#008080] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          title={templates.length >= 15 ? 'Template limit reached. Delete a template to create a new one.' : ''}
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#008080] animate-spin mx-auto mb-4" />
          <p className="text-[#718096]">Loading templates...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-[#718096] mb-4">No templates yet. Create your first template to get started!</p>
          <p className="text-xs text-[#718096] mb-4">You can create up to 15 templates</p>
          <button
            onClick={handleNewTemplate}
            className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {paginatedTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {template.type === 'whatsapp' ? (
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Mail className="w-5 h-5 text-blue-600" />
                  )}
                  <h3 className="text-lg font-semibold text-[#2D3748]">{template.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  template.type === 'whatsapp' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {template.type}
                </span>
              </div>
              
              <div className="flex-grow">
                {template.image && (
                  <div className="mb-4">
                    <img 
                      src={getImageUrl(template.image)} 
                      alt="Template" 
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
                
                <p className="text-sm text-[#718096] mb-4 line-clamp-3">
                  {template.message}
                </p>
                
                {template.type === 'email' && template.subject && (
                  <p className="text-xs text-[#718096] mb-4">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[#008080] text-white hover:bg-[#006666] rounded transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Use this
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#008080] hover:bg-[#008080]/10 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#008080] hover:bg-[#008080]/10 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={templates.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />
        </>
      )}

      {/* Platform Selection Modal */}
      {showPlatformSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#2D3748]">Create New Template</h2>
              <button
                onClick={() => {
                  setShowPlatformSelection(false);
                  setTemplateName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-[#718096] mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                  placeholder="e.g., Welcome Message, Promotional Offer"
                />
              </div>

              <div>
                <p className="text-sm text-[#718096] mb-4">Choose a platform to create your template</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePlatformSelect('whatsapp')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-[#008080] hover:bg-[#008080]/5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-12 h-12 text-[#008080] mb-3" />
                    <span className="text-lg font-semibold text-[#2D3748]">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handlePlatformSelect('email')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-[#008080] hover:bg-[#008080]/5 transition-all cursor-pointer"
                  >
                    <Mail className="w-12 h-12 text-[#008080] mb-3" />
                    <span className="text-lg font-semibold text-[#2D3748]">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateSelection && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-[#2D3748]">Select Template</h2>
                <p className="text-sm text-[#718096] mt-1">
                  Choose a template to customize for {selectedPlatform === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowTemplateSelection(false);
                    setShowPlatformSelection(true);
                  }}
                  className="px-4 py-2 text-sm text-[#718096] hover:text-[#2D3748] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setShowTemplateSelection(false);
                    setSelectedPlatform(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#718096]" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messagePatterns[selectedPlatform].map((pattern, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateSelect(pattern)}
                    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-[#008080] hover:bg-[#008080]/5 transition-all cursor-pointer"
                  >
                    <h3 className="font-semibold text-[#2D3748] mb-2">{pattern.name}</h3>
                    <p className="text-sm text-[#718096]">{pattern.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pattern.hasImage && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Image</span>
                      )}
                      {pattern.hasHeading && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Heading</span>
                      )}
                      {pattern.hasHtml && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">HTML</span>
                      )}
                      {!pattern.hasImage && !pattern.hasHeading && !pattern.hasHtml && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Text Only</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {!editingTemplate && formData.pattern && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowTemplateSelection(true);
                    }}
                    className="px-4 py-2 text-sm text-[#718096] hover:text-[#2D3748] transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <h2 className="text-2xl font-semibold text-[#2D3748]">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingTemplate && (
                <>
                  <div>
                    <label className="block text-sm text-[#718096] mb-2">Template Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                      placeholder="e.g., Welcome Message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#718096] mb-2">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </>
              )}
              
              {!editingTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2D3748]">{formData.name}</p>
                      <p className="text-xs text-[#718096] mt-1">
                        Platform: <span className="capitalize">{formData.type}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Subject - only for email patterns */}
              {formData.type === 'email' && (
                <div>
                  <label className="block text-sm text-[#718096] mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required={formData.type === 'email'}
                    className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    placeholder="Email subject"
                  />
                </div>
              )}

              {/* Heading field - only for WhatsApp patterns with heading */}
              {formData.type === 'whatsapp' && formData.pattern && (formData.pattern === 'heading-text' || formData.pattern === 'heading-image-text') && (
                <div>
                  <label className="block text-sm text-[#718096] mb-2">Heading <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    placeholder="Enter heading text..."
                  />
                </div>
              )}

              {/* Message field - show based on pattern */}
              {formData.pattern && formData.pattern !== 'image-only' && (
                <div>
                  <label className="block text-sm text-[#718096] mb-2">
                    {formData.useHtml && formData.type === 'email' ? 'HTML Content' : 'Message'} <span className="text-red-500">*</span>
                  </label>
                  {formData.useHtml && formData.type === 'email' ? (
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={12}
                      className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent font-mono text-sm"
                      placeholder="Enter HTML code for your email..."
                    />
                  ) : (
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                      placeholder="Enter your message template..."
                    />
                  )}
                </div>
              )}

              {/* Message field for editing existing templates without pattern */}
              {!formData.pattern && editingTemplate && (
                <div>
                  <label className="block text-sm text-[#718096] mb-2">Message <span className="text-red-500">*</span></label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    placeholder="Enter your message template..."
                  />
                </div>
              )}

              {/* Image field - show based on pattern */}
              {formData.pattern && (
                (formData.pattern === 'image-only' || 
                 formData.pattern === 'image-text' || 
                 formData.pattern === 'heading-image-text' ||
                 (formData.type === 'email' && formData.pattern === 'image-text')) && (
                  <div>
                    <label className="block text-sm text-[#718096] mb-2">
                      Image {formData.pattern === 'image-only' ? '(Required)' : '(Optional - JPG, PNG)'}
                    </label>
                    {!imagePreview ? (
                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragging
                            ? 'border-[#008080] bg-[#008080]/10'
                            : 'border-[#718096]/30 hover:border-[#008080]/50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="w-12 h-12 text-[#718096] mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-[#2D3748] mb-1">
                            {isDragging ? 'Drop image here' : 'Drag and drop image here'}
                          </p>
                          <p className="text-xs text-[#718096]">
                            or click to browse (JPG, PNG - Max 5MB)
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                validateAndSetImage(file);
                              }
                            }}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="mt-3 inline-block px-4 py-2 bg-[#008080] text-white text-sm rounded-lg hover:bg-[#006666] transition-colors cursor-pointer"
                          >
                            Browse Files
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-[#718096]/30 rounded-lg p-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-48 object-contain rounded mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-[#718096] mt-2">Accepted formats: JPG, PNG (Max 5MB)</p>
                  </div>
                )
              )}
              
              {/* Show image field for editing existing templates without pattern */}
              {editingTemplate && !formData.pattern && (
                <div>
                  <label className="block text-sm text-[#718096] mb-2">Image (Optional - JPG, PNG)</label>
                  {!imagePreview ? (
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-[#008080] bg-[#008080]/10'
                          : 'border-[#718096]/30 hover:border-[#008080]/50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[#718096] mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-[#2D3748] mb-1">
                          {isDragging ? 'Drop image here' : 'Drag and drop image here'}
                        </p>
                        <p className="text-xs text-[#718096]">
                          or click to browse (JPG, PNG - Max 5MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              validateAndSetImage(file);
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="mt-3 inline-block px-4 py-2 bg-[#008080] text-white text-sm rounded-lg hover:bg-[#006666] transition-colors cursor-pointer"
                        >
                          Browse Files
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-[#718096]/30 rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-48 object-contain rounded mx-auto"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-[#718096] mt-2">Accepted formats: JPG, PNG (Max 5MB)</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-[#2D3748] px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2D3748]">Template Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <div className="p-6">
              {previewTemplate.type === 'whatsapp' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-[#2D3748]">{previewTemplate.name}</h3>
                  </div>
                  {previewTemplate.image && (
                    <div className="mb-4">
                      <img 
                        src={getImageUrl(previewTemplate.image)} 
                        alt="Template" 
                        className="w-full max-w-md rounded"
                      />
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4 whitespace-pre-wrap text-[#2D3748]">
                    {previewTemplate.message}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-[#2D3748]">{previewTemplate.name}</h3>
                  </div>
                  {previewTemplate.subject && (
                    <div className="mb-4 bg-white rounded-lg p-4">
                      <p className="text-sm text-[#718096] mb-1">Subject:</p>
                      <p className="font-semibold text-[#2D3748]">{previewTemplate.subject}</p>
                    </div>
                  )}
                  {previewTemplate.image && (
                    <div className="mb-4">
                      <img 
                        src={getImageUrl(previewTemplate.image)} 
                        alt="Template" 
                        className="w-full max-w-md rounded"
                      />
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4 whitespace-pre-wrap text-[#2D3748]">
                    {previewTemplate.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-red-600">{errorPopup.title}</h3>
              <button
                onClick={() => setErrorPopup(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#2D3748]">{errorPopup.message}</p>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setErrorPopup(null)}
                className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Template Modal */}
      {showUseTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2D3748]">Use Template: {selectedTemplate.name}</h2>
              <button
                onClick={() => {
                  setShowUseTemplateModal(false);
                  setSelectedTemplate(null);
                  setContactList('');
                  setCampaignName('');
                  setCsvFile(null);
                  setShowSampleCsv(false);
                  if (csvInputRef.current) {
                    csvInputRef.current.value = '';
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#718096] mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                  placeholder="e.g., Q1 Marketing Campaign"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-[#718096]">
                    {selectedTemplate.type === 'whatsapp' ? 'Phone Numbers' : 'Email Addresses'}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={downloadSampleCsv}
                      className="text-xs text-[#008080] hover:text-[#006666] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download Sample CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSampleCsv(!showSampleCsv)}
                      className="text-xs text-[#008080] hover:text-[#006666] hover:underline"
                    >
                      {showSampleCsv ? 'Hide' : 'Show'} Sample CSV
                    </button>
                  </div>
                </div>
                
                {showSampleCsv && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                    <p className="text-xs text-[#718096] mb-2 font-semibold">Sample CSV Format:</p>
                    <div className="bg-white border border-gray-300 rounded p-2 font-mono text-xs overflow-x-auto">
                      {selectedTemplate.type === 'whatsapp' ? (
                        <pre>{`Phone Number
077 123 4567
077 234 5678
077 345 6789`}</pre>
                      ) : (
                        <pre>{`Email Address
email1@example.com
email2@example.com
email3@example.com`}</pre>
                      )}
                    </div>
                    <p className="text-xs text-[#718096] mt-2">
                      Note: First row can be a header. Only the first column will be used.
                    </p>
                  </div>
                )}

                <div className="mb-2">
                  <label className="block text-xs text-[#718096] mb-1">Upload CSV File (Optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="px-4 py-2 bg-gray-100 text-[#2D3748] text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300"
                    >
                      Choose CSV File
                    </label>
                    {csvFile && (
                      <span className="text-sm text-[#718096] flex items-center gap-2">
                        <span>{csvFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCsvFile(null);
                            setContactList('');
                            if (csvInputRef.current) {
                              csvInputRef.current.value = '';
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#718096] mb-2">
                  Or enter {selectedTemplate.type === 'whatsapp' ? 'phone numbers' : 'email addresses'} manually (separated by commas, semicolons, or new lines)
                </p>
                <textarea
                  value={contactList}
                  onChange={(e) => setContactList(e.target.value)}
                  required
                  rows={8}
                  className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent font-mono text-sm"
                  placeholder={
                    selectedTemplate.type === 'whatsapp' 
                      ? '077 123 4567\n077 234 5678\n077 345 6789'
                      : 'email1@example.com\nemail2@example.com\nemail3@example.com'
                  }
                />
                <p className="text-xs text-[#718096] mt-1">
                  {parseContactList(contactList).length} contact(s) detected
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Template Preview:</strong>
                </p>
                {selectedTemplate.type === 'email' && selectedTemplate.subject && (
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Subject:</strong> {selectedTemplate.subject}
                  </p>
                )}
                <p className="text-sm text-blue-700 mt-1 whitespace-pre-wrap">{selectedTemplate.message}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateCampaignFromTemplate}
                  disabled={isCreatingCampaign || !campaignName.trim() || parseContactList(contactList).length === 0}
                  className="flex-1 bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingCampaign ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Create Campaign
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowUseTemplateModal(false);
                    setSelectedTemplate(null);
                    setContactList('');
                    setCampaignName('');
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

