// Google Maps utility functions and types
export interface LatLng {
  lat: number;
  lng: number;
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  polyline: string;
}

// Utility function to calculate distance between two points (Haversine formula)
export function calculateDistance(
  point1: LatLng,
  point2: LatLng,
  unit: 'km' | 'miles' = 'km'
): number {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) *
    Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Default center point (Nairobi, Kenya)
export const DEFAULT_CENTER: LatLng = {
  lat: -1.286389,
  lng: 36.817223
};

// Map styling options
export const MAP_STYLES = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
];

// Utility function to check if Google Maps API is loaded
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' &&
         typeof window.google !== 'undefined' &&
         typeof window.google.maps !== 'undefined';
}