// frontend/src/components/dashboard/MapComponent.tsx
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

// Define the type for a single clinic, matching your data structure
type Clinic = {
  clinic_id: number;
  name: string;
  latitude: number;
  longitude: number;
};

// Define the props for your MapComponent
interface MapComponentProps {
  clinics: Clinic[];
  userLocation?: { lat: number; lng: number };
}

const MapComponent = ({ clinics, userLocation }: MapComponentProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Default to Nairobi

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  }, [userLocation]);

  if (!apiKey) {
    return <div className="text-red-500">Google Maps API key is missing.</div>;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: "100%", width: "100%" }}>
        <Map
          defaultZoom={11}
          center={center}
          mapId={"medimap-care-map"}
        >
          {clinics.map((clinic) => (
            <AdvancedMarker
              key={clinic.clinic_id}
              position={{ lat: clinic.latitude, lng: clinic.longitude }}
              title={clinic.name}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapComponent;