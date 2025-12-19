import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Siren, Clock, Milestone } from "lucide-react";
import GoogleMapContainer from "@/components/map/GoogleMapContainer";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useClinicsSearch } from "@/hooks/useClinicsSearch";
import { useDirections } from "@/hooks/useDirections";
import { useGeocode } from "@/hooks/useGeocode";
import { api } from "@/lib/api";
import PinMarker from "@/components/map/PinMarker";

type Clinic = {
  id: string | number;
  name: string;
  position: { lat: number; lng: number };
  rating?: number;
  raw?: any;
};
 
// Straight-line distance fallback in km
function computeDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
 
type EmergencyState = "idle" | "locating" | "searching" | "found" | "enRoute" | "arrived";

const Emergency = () => {
  const [state, setState] = useState<EmergencyState>("idle");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm] = useState<number>(5);
  const [selectedHospital, setSelectedHospital] = useState<Clinic | null>(null);
  const [ambulancePosition, setAmbulancePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [metricsById, setMetricsById] = useState<Record<string, { distanceText?: string; durationText?: string }>>({});
 
  // geocode helpers (optional logging/use)
  const { reverseGeocode } = useGeocode();

  // Fetch hospitals near user
  const { data: clinicsData, isFetching } = useClinicsSearch({
    userLocation: userLocation || undefined,
    radiusMode: "preset",
    radiusKm,
    types: ["hospital"],
    ranking: "POPULARITY",
    maxResults: 20,
    skipCache: false,
  });

  const hospitals: Clinic[] = useMemo(() => {
    return (clinicsData?.normalized || []).map((c) => ({
      id: c.id,
      name: c.name,
      position: c.position,
      rating: c.rating,
      raw: c.raw,
    }));
  }, [clinicsData]);

  // Directions from hospital -> user
  const { data: directions } = useDirections({
    origin: selectedHospital?.position,
    destination: userLocation || undefined,
    enabled: !!(selectedHospital && userLocation),
  });
 
  // Precompute distance/duration for list cards (top 12 for performance)
  useEffect(() => {
    if (!userLocation || !hospitals.length) return;
    let aborted = false;
    (async () => {
      const entries = await Promise.all(
        hospitals.slice(0, 12).map(async (h) => {
          try {
            const r = await api.getDirections({ origin: h.position, destination: userLocation });
            return [String(h.id), { distanceText: r.distance || r.distanceText, durationText: r.duration || r.durationText }] as const;
          } catch {
            const km = computeDistanceKm(userLocation, h.position);
            return [String(h.id), { distanceText: `${km.toFixed(1)} km` }] as const;
          }
        })
      );
      if (!aborted) setMetricsById(Object.fromEntries(entries));
    })();
    return () => {
      aborted = true;
    };
  }, [userLocation?.lat, userLocation?.lng, hospitals.map(h => h.id).join(",")]);
  // Start flow
  const handleEmergencyClick = () => {
    setState("locating");
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setState("idle");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        // run a quick reverse geocode silently
        reverseGeocode(loc).catch(() => {});
        setState("searching");
      },
      () => {
        alert("Could not get your location. Please enable location services.");
        setState("idle");
      }
    );
  };

  // Transition when hospitals available
  useEffect(() => {
    if (state === "searching" && !isFetching) {
      setState("found");
    }
  }, [state, isFetching]);

  // Request ambulance from a hospital
  const handleRequestAmbulance = (hospital: Clinic) => {
    if (!userLocation) return;
    setSelectedHospital(hospital);
    setState("enRoute");
  };

  // Simple polyline overlay using Google Maps JS API (our version lacks a Polyline component export)
  const RoutePolyline = ({ path }: { path: { lat: number; lng: number }[] }) => {
    const map = useMap();
    useEffect(() => {
      if (!map || !path?.length || !(window as any).google) return;
      const polyline = new (window as any).google.maps.Polyline({
        path,
        strokeColor: "#FB923C",
        strokeOpacity: 1,
        strokeWeight: 5,
        map,
      });
      return () => {
        polyline.setMap(null);
      };
    }, [map, path]);
    return null;
  };

  // Simulate ambulance movement along decoded path
  useEffect(() => {
    if (state !== "enRoute" || !directions?.path?.length) return;
    let step = 0;
    const total = directions.path.length;
    const interval = setInterval(() => {
      if (step < total) {
        const pos = directions.path[step];
        setAmbulancePosition(pos);
        const progress = step / total;
        const remainingMinutes = Math.max(0, Math.ceil((1 - progress) * 10)); // naive 10-min baseline
        setEta(remainingMinutes === 0 ? "Arriving now" : `${remainingMinutes} min`);
        step += 1;
      } else {
        clearInterval(interval);
        setState("arrived");
        setEta("Arrived");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state, directions]);

  // Map overlays
  const userMarker = useMemo(() => {
    if (!userLocation) return null;
    return (
      <AdvancedMarker position={userLocation}>
        <PinMarker color="#F44336" selected />
      </AdvancedMarker>
    );
  }, [userLocation]);

  const hospitalMarkers = useMemo(() => {
    return hospitals.map((h) => (
      <AdvancedMarker
        key={String(h.id)}
        position={h.position}
        title={h.name}
        onClick={() => setSelectedHospital(h)}
      >
        <PinMarker
          color={selectedHospital?.id === h.id ? "#2563EB" : "#10B981"}
          selected={selectedHospital?.id === h.id}
        />
      </AdvancedMarker>
    ));
  }, [hospitals, selectedHospital]);

  const ambulanceMarker = useMemo(() => {
    if (!ambulancePosition) return null;
    return (
      <AdvancedMarker position={ambulancePosition}>
        <PinMarker color="#EF4444" selected />
      </AdvancedMarker>
    );
  }, [ambulancePosition]);

  const onMapReady = useCallback(
    (ctx: { fitBounds: (b: any, p?: number) => void }) => {
      if (userLocation && selectedHospital) {
        const north = Math.max(userLocation.lat, selectedHospital.position.lat);
        const south = Math.min(userLocation.lat, selectedHospital.position.lat);
        const east = Math.max(userLocation.lng, selectedHospital.position.lng);
        const west = Math.min(userLocation.lng, selectedHospital.position.lng);
        ctx.fitBounds({ north, south, east, west }, 64);
      }
    },
    [userLocation, selectedHospital]
  );

  return (
    <div className="min-h-full bg-muted/20 flex flex-col gap-6 p-4">
      {state === "idle" && (
        <div className="flex flex-col items-center gap-6 py-10">
          <h1 className="text-4xl font-bold text-destructive">Emergency Assistance</h1>
          <p className="text-lg text-muted-foreground max-w-md text-center">
            Press the button below only in a genuine emergency. We’ll locate nearby hospitals and help you request an ambulance.
          </p>
          <Button
            size="lg"
            variant="destructive"
            className="h-24 w-24 rounded-full shadow-lg animate-pulse"
            onClick={handleEmergencyClick}
            aria-label="Start emergency flow"
          >
            <Siren className="h-12 w-12" />
          </Button>
        </div>
      )}

      {state !== "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">
            {state === "locating" && "Locating your position..."}
            {state === "searching" && "Finding nearby hospitals..."}
            {state === "found" && "Nearby hospitals found. Select one to request an ambulance."}
            {state === "enRoute" && `Ambulance en route from ${selectedHospital?.name || "hospital"}!`}
            {state === "arrived" && "Ambulance has arrived."}
          </h2>

          <div className="w-full h-[520px] bg-card rounded-xl border border-border overflow-hidden relative">
            <GoogleMapContainer center={userLocation || undefined} onReady={onMapReady} className="w-full h-full">
              {() => (
                <>
                  {userMarker}
                  {hospitalMarkers}
                  {directions?.path?.length ? <RoutePolyline path={directions.path} /> : null}
                  {ambulanceMarker}
                </>
              )}
            </GoogleMapContainer>

            {(isFetching || state === "locating" || state === "searching") && (
              <div className="absolute top-2 left-2 bg-background/90 border border-border rounded px-3 py-1 text-xs">
                Loading...
              </div>
            )}
            {state === "enRoute" && eta && (
              <div className="absolute top-2 right-2 bg-background/90 border border-border rounded px-3 py-1 text-xs flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> ETA: {eta}
              </div>
            )}
          </div>

          {state === "found" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((h) => (
                <div key={String(h.id)} className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-2">
                  <h3 className="font-semibold">{h.name}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Milestone className="h-4 w-4" />
                    <span>
                      {metricsById[String(h.id)]?.distanceText ||
                        (userLocation ? `${computeDistanceKm(userLocation, h.position).toFixed(1)} km` : "Distance —")}
                      {metricsById[String(h.id)]?.durationText ? ` • ${metricsById[String(h.id)]?.durationText}` : ""}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rating: {typeof h.rating === "number" ? h.rating.toFixed(1) : "N/A"}
                  </div>
                  <Button className="mt-2" onClick={() => handleRequestAmbulance(h)}>
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