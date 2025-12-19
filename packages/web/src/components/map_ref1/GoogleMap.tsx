import React from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  children?: React.ReactNode;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: -1.286389, lng: 36.817223 }, // Default to Nairobi
  zoom = 14,
  children,
  className = "w-full h-full"
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-red-500">Google Maps API key is missing.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        className={className}
        mapId="406f6b59fb4b841156da74b1"
      >
        {children}
      </Map>
    </APIProvider>
  );
};

export default GoogleMap;