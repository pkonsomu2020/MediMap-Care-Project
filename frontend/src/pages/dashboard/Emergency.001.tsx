import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Siren, Clock, Milestone } from 'lucide-react';
import { api } from '@/lib/api';
import MapComponent from '@/components/dashboard/MapComponent';
import { APIProvider, AdvancedMarker } from '@vis.gl/react-google-maps';

// Define the type for a single clinic, matching your data structure
type Clinic = {
  clinic_id: number;
  name: string;
  latitude: number;
  longitude: number;
  google_place_id: string;
  distance?: string;
  duration?: string;
  polyline?: string;
};

const Emergency = () => {
  const [emergencyState, setEmergencyState] = useState('idle'); // idle, searching, found, requested, enroute
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [hospitals, setHospitals] = useState<Clinic[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Clinic | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [ambulancePosition, setAmbulancePosition] = useState<{ lat: number; lng: number } | undefined>();
  const [eta, setEta] = useState<string | null>(null);

  const handleEmergencyClick = () => {
    setEmergencyState('searching');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          alert("Could not get your location. Please enable location services.");
          setEmergencyState('idle');
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setEmergencyState('idle');
    }
  };

  const findNearbyHospitals = useCallback(async () => {
    if (!userLocation) return;
    try {
      console.log("Searching for nearby hospitals with params:", { ...userLocation, type: 'hospital', radius: 10000 });
      const response = await api.searchNearbyPlaces({ ...userLocation, type: 'hospital', radius: 10000 });
      console.log("Received response from searchNearbyPlaces:", response);
      const hospitalsWithDetails = await Promise.all(
        response.clinics.map(async (hospital: Clinic) => {
          try {
            const details = await api.getDirections({
              origin: { lat: hospital.latitude, lng: hospital.longitude },
              destination: userLocation,
            });
            return { ...hospital, distance: details.distance, duration: details.duration, polyline: details.polyline };
          } catch (error) {
            console.error(`Failed to get directions for ${hospital.name}`, error);
            return hospital; // Return hospital without details if directions fail
          }
        })
      );
      setHospitals(hospitalsWithDetails);
      setEmergencyState('found');
    } catch (error) {
      console.error("Failed to find nearby hospitals", error);
      alert("Failed to find nearby hospitals.");
      setEmergencyState('idle');
    }
  }, [userLocation]);

  useEffect(() => {
    if (emergencyState === 'searching' && userLocation) {
      findNearbyHospitals();
    }
  }, [emergencyState, userLocation, findNearbyHospitals]);

  const handleRequestAmbulance = (hospital: Clinic) => {
    if (!userLocation) return;
    setSelectedHospital(hospital);
    setDirections({
      polyline: hospital.polyline || '',
      distance: hospital.distance || '',
      duration: hospital.duration || ''
    });
    setEmergencyState('enroute');
  };

  const handleUserLocationDragEnd = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    findNearbyHospitals();
  };

  useEffect(() => {
    if (emergencyState === 'enroute' && directions && directions.polyline && typeof google !== 'undefined' && google.maps?.geometry) {
      // Simulate ambulance movement
      const decodedPath = google.maps.geometry.encoding.decodePath(directions.polyline);
      let step = 0;
      const interval = setInterval(() => {
        if (step < decodedPath.length) {
          const position = decodedPath[step];
          setAmbulancePosition({ lat: position.lat(), lng: position.lng() });
          // Estimate ETA based on progress
          const progress = step / decodedPath.length;
          if (progress < 1) {
            const remainingMinutes = Math.ceil((1 - progress) * 10); // Simulate 10 minutes total
            setEta(`${remainingMinutes} min`);
          }
          step++;
        } else {
          clearInterval(interval);
          setEta('Arrived');
        }
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [emergencyState, directions]);

  return (
    <div className="min-h-full bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
      {emergencyState === 'idle' && (
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-destructive">Emergency Assistance</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Press the button below only in a genuine emergency. This will find the nearest hospitals and allow you to request an ambulance.
          </p>
          <Button
            size="lg"
            variant="destructive"
            className="h-24 w-24 rounded-full shadow-lg animate-pulse"
            onClick={handleEmergencyClick}
          >
            <Siren className="h-12 w-12" />
          </Button>
        </div>
      )}

      {(emergencyState === 'searching' || emergencyState === 'found' || emergencyState === 'requested' || emergencyState === 'enroute') && (
        <div className="w-full h-full flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">
            {emergencyState === 'searching' && 'Finding nearby hospitals...'}
            {emergencyState === 'found' && 'Nearby hospitals found. Select one to request an ambulance.'}
            {emergencyState === 'requested' && `Requesting ambulance from ${selectedHospital?.name}...`}
            {emergencyState === 'enroute' && `Ambulance en route from ${selectedHospital?.name}!`}
          </h2>
          <div className="w-full h-[600px]">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['geometry', 'places']}>
              <MapComponent
                clinics={hospitals}
                userLocation={userLocation}
                directions={emergencyState === 'enroute' ? directions : null}
                onUserLocationDragEnd={handleUserLocationDragEnd}
              >
                {ambulancePosition && (
                  <AdvancedMarker position={ambulancePosition}>
                                                                          <img src="/Ambulance_4.png" alt="Ambulance" className="h-8 w-8" />
                  </AdvancedMarker>
                )}
              </MapComponent>
            </APIProvider>
          </div>
          {emergencyState === 'enroute' && eta && (
            <div className="text-xl font-bold">ETA: {eta}</div>
          )}
          {emergencyState === 'found' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {hospitals.map(hospital => (
                <div key={hospital.clinic_id} className="bg-card p-4 rounded-lg shadow-md flex flex-col justify-between">
                  <h3 className="font-bold text-lg mb-2">{hospital.name}</h3>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Milestone className="h-4 w-4" />
                      <span>{hospital.distance || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{hospital.duration || 'N/A'} ETA</span>
                    </div>
                  </div>
                  <Button className="mt-4" onClick={() => handleRequestAmbulance(hospital)} disabled={!hospital.polyline}>
                    Request Ambulance
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Emergency;