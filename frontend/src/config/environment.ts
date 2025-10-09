// Environment configuration for Google Maps and API
export const config = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
};

