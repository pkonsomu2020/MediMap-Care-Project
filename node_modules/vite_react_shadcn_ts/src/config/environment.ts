// Environment configuration for Google Maps and API
export const config = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '406f6b59fb4b841156da74b1',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
};

