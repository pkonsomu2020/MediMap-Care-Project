// frontend/src/components/dashboard/MapComponent.tsx
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { config } from "@/config/environment";

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
  const [center, setCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Default to Nairobi

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  }, [userLocation]);


  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Map
        defaultZoom={16}
        center={center}
        mapId={config.mapId}
        gestureHandling="greedy"
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
  );
};

export default MapComponent;