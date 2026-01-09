import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { LeadFinderScreen } from './components/LeadFinderScreen';
import { MyLeadsScreen } from './components/MyLeadsScreen';
import { CampaignsScreen } from './components/CampaignsScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { LinkAccountsScreen } from './components/LinkAccountsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BackendErrorOverlay } from './components/BackendErrorOverlay';
import { getApiUrl } from './config';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Public Route Component (redirects to dashboard if authenticated)
function PublicRoute({ children, isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Dashboard Component
function Dashboard({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  whatsappConnected, 
  sidebarOpen, 
  setSidebarOpen,
  backendDown,
  handleRetryConnection
}) {
  const renderScreen = () => {
    switch (activeTab) {
      case 'lead-finder':
        return <LeadFinderScreen user={user} />;
      case 'my-leads':
        return <MyLeadsScreen />;
      case 'campaigns':
        return <CampaignsScreen />;
      case 'templates':
        return <TemplatesScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'link-accounts':
        return <LinkAccountsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <LeadFinderScreen user={user} />;
    }
  };

  return (
    <>
      <BackendErrorOverlay show={backendDown} onRetry={handleRetryConnection} />
      <div className="flex h-screen bg-white overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }} 
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            user={user} 
            onLogout={onLogout} 
            whatsappConnected={whatsappConnected}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="flex-1 overflow-y-auto bg-white">
            {renderScreen()}
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('lead-finder');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event) => {
      if (event.detail === 'campaigns') {
        setActiveTab('campaigns');
      }
    };
    
    window.addEventListener('navigateToCampaigns', handleNavigate);
    return () => window.removeEventListener('navigateToCampaigns', handleNavigate);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      // Verify token with backend
      fetch(getApiUrl('api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Invalid token');
        })
        .then(data => {
          setUser(data);
          setIsAuthenticated(true);
          setBackendDown(false);
          // Check WhatsApp status when user is authenticated
          checkWhatsAppStatus();
        })
        .catch((error) => {
          // Check if it's a network error (backend down)
          if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            setBackendDown(true);
          } else {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Check WhatsApp connection status at app startup and periodically
  const checkWhatsAppStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
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

  // Check WhatsApp status when authenticated and periodically update
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial check
    checkWhatsAppStatus();
    
    // Check every 10 seconds
    const interval = setInterval(checkWhatsAppStatus, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Check backend connectivity
  const checkBackendHealth = async () => {
    try {
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(getApiUrl('api/auth/me'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || ''}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401) {
        // Backend is up (401 is expected if not authenticated)
        setBackendDown(false);
        return true;
      }
      setBackendDown(true);
      return false;
    } catch (error) {
      // Network error or timeout - backend is down
      if (error.name === 'AbortError' || error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        setBackendDown(true);
      }
      return false;
    }
  };

  // Monitor backend connectivity
  useEffect(() => {
    if (!isAuthenticated) {
      setBackendDown(false);
      return;
    }

    // Initial check
    checkBackendHealth();
    
    // Check every 5 seconds
    const interval = setInterval(checkBackendHealth, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle retry connection
  const handleRetryConnection = async () => {
    setBackendDown(false);
    await checkBackendHealth();
    if (backendDown) {
      // If still down, reload the page after a moment
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Check WhatsApp status after login
    setTimeout(() => checkWhatsAppStatus(), 1000);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    
    // Call logout endpoint
    if (token) {
      fetch(getApiUrl('api/auth/logout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(console.error);
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#718096]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Landing Page */}
        <Route 
          path="/" 
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <LandingPage onLogin={handleLogin} />
            </PublicRoute>
          } 
        />
        
        {/* Protected Route - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                onLogout={handleLogout}
                whatsappConnected={whatsappConnected}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                backendDown={backendDown}
                handleRetryConnection={handleRetryConnection}
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to dashboard if authenticated, otherwise to landing */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
