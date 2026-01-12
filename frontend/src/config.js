// Backend API Configuration
// Set to empty string when frontend is served from backend (same origin)
// Set to full URL when running frontend separately (development)
export const API_BASE_URL = 'https://leadflow.nexgenai.asia';
// export const API_BASE_URL = 'http://localhost:4001';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  if (API_BASE_URL) {
    // Remove trailing slash from API_BASE_URL if present
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}/${cleanEndpoint}`;
  }
  // Use relative path when served from backend (API_BASE_URL is empty)
  return `/${cleanEndpoint}`;
};

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  // Use relative path when served from backend (API_BASE_URL is empty)
  return cleanPath;
};

