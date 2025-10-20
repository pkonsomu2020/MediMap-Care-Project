// frontend/src/pages/dashboard/FindClinics.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, MapPin, Star, Clock, Phone, Navigation, Route, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import GoogleMapContainer from "@/components/map/GoogleMapContainer";
import RadiusControls from "@/components/map/RadiusControls";
import { useClinicsSearch } from "@/hooks/useClinicsSearch";
import { useGeocode } from "@/hooks/useGeocode";
import { useDirections } from "@/hooks/useDirections";
import CustomInfoWindow from "@/components/dashboard/CustomInfoWindow";
import PlaceDetailsInfoWindow from "@/components/dashboard/PlaceDetailsInfoWindow";
import PinMarker from "@/components/map/PinMarker";

// Haversine-ish approximate distance (straight-line) in km
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type NormalizedClinic = ReturnType<typeof useClinicsSearch> extends infer R
  ? R extends { data: infer D }
    ? D extends { normalized: infer N }
      ? N extends Array<infer C>
        ? C
        : any
      : any
    : any
  : any;

const FindClinics = () => {
  // Search UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  // Map/query state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [radiusMode, setRadiusMode] = useState<"preset" | "drag">("preset");

  // Selection/directions
  const [activeClinicId, setActiveClinicId] = useState<string | number | null>(null);
  const [showCompactInfo, setShowCompactInfo] = useState<boolean>(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsClinic, setDetailsClinic] = useState<NormalizedClinic | null>(null);

  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<NormalizedClinic | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Geocode helpers
  const { geocodeAddress, reverseGeocode, forward, reverse } = useGeocode();

  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch clinics via new hook
  const { data: clinicsData, isFetching: isClinicsFetching } = useClinicsSearch({
    userLocation: userLocation || undefined,
    radiusMode,
    radiusKm,
    types: selectedSpecialty === "all" ? undefined : [selectedSpecialty],
    ranking: "DISTANCE", // Changed from POPULARITY to DISTANCE for proximity-based results
    maxResults: 20,
    skipCache: radiusMode === "drag",
  });

  // Sort clinics by distance if user location is available
  const normalizedClinics: NormalizedClinic[] = useMemo(() => {
    const clinics = clinicsData?.normalized || [];
    
    if (!userLocation || clinics.length === 0) {
      return clinics;
    }

    // Calculate distances and sort by proximity
    const clinicsWithDistance = clinics.map(clinic => ({
      ...clinic,
      calculatedDistance: computeDistanceKm(
        userLocation.lat,
        userLocation.lng,
        clinic.position.lat,
        clinic.position.lng
      )
    }));

    // Sort by distance (closest first)
    return clinicsWithDistance.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [clinicsData?.normalized, userLocation]);

  const activeClinic: NormalizedClinic | null = useMemo(
    () => normalizedClinics.find((c) => String(c.id) === String(activeClinicId)) || null,
    [normalizedClinics, activeClinicId]
  );
  const hasUserLocation = !!userLocation;

  // Directions
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null);
  const directionsEnabled = !!(userLocation && routeDestination);
  const { data: directions } = useDirections({
    origin: userLocation || undefined,
    destination: routeDestination || undefined,
    enabled: directionsEnabled,
  });

  // Fit bounds when directions arrive
  const onMapReady = useCallback((ctx: { fitBounds: (b: any, p?: number) => void }) => {
    if (directions && userLocation && routeDestination) {
      const north = Math.max(userLocation.lat, routeDestination.lat);
      const south = Math.min(userLocation.lat, routeDestination.lat);
      const east = Math.max(userLocation.lng, routeDestination.lng);
      const west = Math.min(userLocation.lng, routeDestination.lng);
      ctx.fitBounds({ north, south, east, west }, 64);
    }
  }, [directions, userLocation, routeDestination]);

  // Use my location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        // In drag mode, reverse geocode for address display
        if (radiusMode === "drag") {
          reverseGeocode(loc).catch(() => {});
        }
      },
      () => {
        alert("Could not get your location. Please enable location services.");
      }
    );
  };

  // Forward geocode a typed address/location
  const handleSearch = async () => {
    if (!locationQuery.trim()) return;
    try {
      const res = await geocodeAddress(locationQuery.trim());
      setUserLocation({ lat: res.lat, lng: res.lng });
    } catch (err) {
      // toast/error already logged
    }
  };

  // Handle selecting a clinic for directions
  const handleGetDirections = (clinic: NormalizedClinic) => {
    if (!userLocation) {
      alert("Please set your location first.");
      return;
    }
    setActiveClinicId(clinic.id);
    setRouteDestination(clinic.position);
  };

  // Handle booking appointment
  const handleBookAppointment = (clinic: NormalizedClinic) => {
    setSelectedClinic(clinic);
    setBookingDate(undefined);
    setBookingTime("");
    setBookingDialogOpen(true);
  };

  // Handle view details
  const handleViewDetails = (clinic: NormalizedClinic) => {
    setDetailsClinic(clinic);
    setDetailsDialogOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedClinic || !bookingDate || !bookingTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setBookingLoading(true);
      const appointmentData = {
        place_id: selectedClinic.placeId || selectedClinic.id,
        date: format(bookingDate, "yyyy-MM-dd"),
        time: bookingTime,
        status: "pending" as const,
      };

      await api.createAppointment(appointmentData);

      toast({
        title: "Appointment booked!",
        description: `Your appointment at ${selectedClinic.name} has been scheduled.`,
      });

      setBookingDialogOpen(false);
      setSelectedClinic(null);
      setBookingDate(undefined);
      setBookingTime("");

      // Optionally navigate to appointments page
      // navigate("/dashboard/appointments");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Booking failed",
        description: err.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const userMarker = useMemo(() => {
    if (!userLocation) return null;
    return (
      <AdvancedMarker position={userLocation}>
        <PinMarker color="#F44336" selected />
      </AdvancedMarker>
    );
  }, [userLocation]);

  const clinicsMarkers = useMemo(() => {
    return normalizedClinics.map((c) => (
      <AdvancedMarker
        key={String(c.id)}
        position={c.position}
        title={c.name}
        onClick={() => {
          setActiveClinicId(c.id);
          // Default to UI Kit compact view first, per request
          setShowCompactInfo(true);
        }}
      >
        <PinMarker
          color={activeClinicId === c.id ? "#059669" : "#10B981"}
          selected={activeClinicId === c.id}
        />
      </AdvancedMarker>
    ));
  }, [normalizedClinics, activeClinicId]);

  // Native polyline overlay using Google Maps JS API since Polyline component is unavailable in our version
  const RoutePolyline = ({ path }: { path: { lat: number; lng: number }[] }) => {
    const map = useMap();
    useEffect(() => {
      if (!map || !path || path.length === 0 || !(window as any).google) return;
      const polyline = new (window as any).google.maps.Polyline({
        path,
        strokeColor: '#FB923C',
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

  // Drag-mode user marker + editable radius circle overlay
  const UserDragRadius = ({
    center,
    radiusKm,
    onCenterChange,
    onRadiusKmChange,
    onReverseGeocode,
  }: {
    center: { lat: number; lng: number };
    radiusKm: number;
    onCenterChange: (c: { lat: number; lng: number }) => void;
    onRadiusKmChange: (km: number) => void;
    onReverseGeocode?: (c: { lat: number; lng: number }) => void;
  }) => {
    const map = useMap();
    useEffect(() => {
      if (!map || !(window as any).google) return;

      const g = (window as any).google;
      // Create draggable marker (classic marker works without extra libraries)
      const marker = new g.maps.Marker({
        position: center,
        draggable: true,
        map,
        title: 'Drag to adjust your location',
      });

      // Editable circle for radius
      const circle = new g.maps.Circle({
        center,
        radius: Math.max(0.1, radiusKm) * 1000,
        editable: true,
        strokeColor: '#22c55e',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.15,
        map,
      });

      // Keep marker on circle center
      circle.bindTo('center', marker, 'position');

      let debounceTimer: any = null;
      const DEBOUNCE_MS = 350;

      const emitCenterChanged = () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const next = { lat: pos.lat(), lng: pos.lng() };
        onCenterChange(next);
        if (onReverseGeocode) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => onReverseGeocode(next), DEBOUNCE_MS);
        }
      };

      const emitRadiusChanged = () => {
        const rMeters = circle.getRadius();
        if (typeof rMeters === 'number') {
          const km = Math.max(0.1, rMeters / 1000);
          onRadiusKmChange(Math.round(km * 10) / 10);
        }
      };

      const markerDragEnd = g.maps.event.addListener(marker, 'dragend', emitCenterChanged);
      const circleCenterChanged = g.maps.event.addListener(circle, 'center_changed', emitCenterChanged);
      const circleRadiusChanged = g.maps.event.addListener(circle, 'radius_changed', emitRadiusChanged);

      // Sync external prop changes
      circle.setCenter(center);
      circle.setRadius(Math.max(0.1, radiusKm) * 1000);
      marker.setPosition(center);

      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        g.maps.event.removeListener(markerDragEnd);
        g.maps.event.removeListener(circleCenterChanged);
        g.maps.event.removeListener(circleRadiusChanged);
        marker.setMap(null);
        circle.setMap(null);
      };
    }, [map, center.lat, center.lng, radiusKm]);

    return null;
  };

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Find Clinics</h1>
              <p className="text-muted-foreground text-sm">
                Discover nearby clinics, set radius, and get directions.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Badge variant="secondary">Map powered by Google</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Search & Filters</h2>
              </div>

              {/* Location input + actions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  {userLocation && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {reverse.result?.formattedAddress ? 'Address found' : 'Location set'}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your location"
                    className="pl-10"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSearch} size="sm" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={handleUseMyLocation} variant="outline" size="sm" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    My Location
                  </Button>
                  <Button
                    onClick={() => {
                      if (userLocation) {
                        reverseGeocode(userLocation).catch(() => {});
                      }
                    }}
                    variant="secondary"
                    size="sm"
                    disabled={!userLocation || reverse.loading}
                    className="w-full"
                    title="Get the address for your current location coordinates"
                  >
                    {reverse.loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Address...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Reverse Geocode
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Show reverse geocode result if available */}
                {reverse.result?.formattedAddress && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <strong>Address:</strong> {reverse.result.formattedAddress}
                  </div>
                )}
              </div>

              {/* Radius controls */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-foreground">Search Radius</label>
                <RadiusControls
                  radiusKm={radiusKm}
                  setRadiusKm={setRadiusKm}
                  radiusMode={radiusMode}
                  setRadiusMode={setRadiusMode}
                  disabled={!hasUserLocation}
                  className="gap-2"
                />
              </div>

              {/* Specialty (types) */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Healthcare Type</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hospital">🏥 Hospital</SelectItem>
                    <SelectItem value="doctor">👨‍⚕️ Doctor</SelectItem>
                    <SelectItem value="pharmacy">💊 Pharmacy</SelectItem>
                    <SelectItem value="clinic">🏥 Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results and Map */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map */}
            <div className="bg-card rounded-xl h-96 border border-border shadow-soft overflow-hidden relative">
              <GoogleMapContainer
                center={userLocation || undefined}
                onReady={onMapReady}
                className="w-full h-full"
              >
                {({ map }) => (
                  <>
                    {userMarker}
                    {clinicsMarkers}
                    {directions?.path?.length ? <RoutePolyline path={directions.path} /> : null}
                    {radiusMode === 'drag' && userLocation ? (
                      <UserDragRadius
                        center={userLocation}
                        radiusKm={radiusKm}
                        onCenterChange={(c) => setUserLocation(c)}
                        onRadiusKmChange={(km) => setRadiusKm(km)}
                        onReverseGeocode={(c) => reverseGeocode(c).catch(() => {})}
                      />
                    ) : null}

                    {/* Info Windows */}
                    {activeClinic ? (
                      showCompactInfo && activeClinic.placeId ? (
                        <PlaceDetailsInfoWindow
                          placeId={String(activeClinic.placeId)}
                          position={activeClinic.position}
                          onCloseClick={() => {
                            setActiveClinicId(null);
                            setShowCompactInfo(false);
                          }}
                        />
                      ) : (
                        <CustomInfoWindow
                          clinic={{
                            id: activeClinic.id,
                            name: activeClinic.name,
                            position: activeClinic.position,
                            placeId: activeClinic.placeId ? String(activeClinic.placeId) : undefined,
                            rating: activeClinic.rating,
                            address:
                              activeClinic.raw?.address ||
                              activeClinic.raw?.formattedAddress ||
                              undefined,
                            durationText: activeClinic.durationText,
                            distanceText: activeClinic.distanceText,
                            phone: activeClinic.raw?.contact || null,
                            website: activeClinic.raw?.websiteUri || null,
                            is_open:
                              typeof activeClinic.raw?.is_open === "boolean"
                                ? activeClinic.raw.is_open
                                : null,
                            wheelchairAccessibleEntrance:
                              activeClinic.raw?.wheelchairAccessibleEntrance ?? null,
                            raw: activeClinic.raw,
                          }}
                          onClose={() => {
                            setActiveClinicId(null);
                            setShowCompactInfo(false);
                          }}
                          onToggleCompact={
                            activeClinic.placeId
                              ? () => setShowCompactInfo(true)
                              : undefined
                          }
                        />
                      )
                    ) : null}
                  </>
                )}
              </GoogleMapContainer>

              {/* Overlay status */}
              {(isClinicsFetching || forward.loading || reverse.loading) && (
                <div className="absolute top-2 left-2 bg-background/90 border border-border rounded px-3 py-1 text-xs">
                  Loading...
                </div>
              )}
            </div>

            {/* Clinic Cards */}
            <div className="space-y-4">
              {normalizedClinics.map((clinic) => (
                <div
                  key={String(clinic.id)}
                  className="bg-card rounded-xl p-4 md:p-6 shadow-soft border border-border flex flex-col md:flex-row gap-4 items-start"
                >
                  {/* Left icon / avatar box */}
                  <div className="flex-shrink-0 rounded-lg w-16 h-16 md:w-20 md:h-20 bg-primary/10 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-primary flex items-center justify-center text-white">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg">{clinic.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {clinic.raw?.address || clinic.raw?.formattedAddress || "Address unavailable"}
                          </span>
                          {/* distance (approx) */}
                          {clinic.position && userLocation && (
                            <span className="ml-3 text-muted-foreground flex-shrink-0">
                              •{" "}
                              {computeDistanceKm(
                                userLocation.lat,
                                userLocation.lng,
                                clinic.position.lat,
                                clinic.position.lng
                              ).toFixed(1)}{" "}
                              km
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-left md:text-right flex-shrink-0">
                        {clinic.raw?.is_active !== false ? (
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs">
                            Available
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                        <span className="font-medium">
                          {typeof clinic.rating === "number" ? clinic.rating.toFixed(1) : "N/A"}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          ({clinic.raw?.userRatingCount || clinic.raw?.reviews_count || 0} reviews)
                        </span>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-muted/50 text-sm self-start">
                        {clinic.raw?.category || clinic.raw?.types?.[0] || "General"}
                      </div>

                      {(clinic.distanceText || clinic.durationText) && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {clinic.distanceText || "--"} • {clinic.durationText || "--"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 w-full"
                        onClick={() => handleBookAppointment(clinic)}
                      >
                        Book Appointment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetails(clinic)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const phone = clinic.raw?.contact || clinic.phone;
                          if (phone) {
                            window.open(`tel:${phone}`);
                          } else {
                            toast({
                              title: "Contact not available",
                              description: "This clinic doesn't have a phone number listed.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleGetDirections(clinic)}
                        disabled={!userLocation}
                      >
                        <Route className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {!normalizedClinics.length && hasUserLocation && (
                <div className="text-sm text-muted-foreground">
                  No clinics found within the selected radius. Try increasing the radius or changing filters.
                </div>
              )}
              {!hasUserLocation && (
                <div className="text-sm text-muted-foreground">
                  Set your location to discover nearby clinics.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment at {selectedClinic?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !bookingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Time</label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
              disabled={bookingLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={bookingLoading || !bookingDate || !bookingTime}
            >
              {bookingLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{detailsClinic?.name}</DialogTitle>
            <DialogDescription>
              Clinic details and information
            </DialogDescription>
          </DialogHeader>
          {detailsClinic && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Address</label>
                <p className="text-sm text-muted-foreground">
                  {detailsClinic.raw?.address || detailsClinic.raw?.formattedAddress || 'Address not provided'}
                </p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contact</label>
                <p className="text-sm text-muted-foreground">
                  {detailsClinic.raw?.contact || 'Contact information not available'}
                </p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold">
                    {typeof detailsClinic.rating === 'number' ? detailsClinic.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
            {detailsClinic && (
              <Button
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleBookAppointment(detailsClinic);
                }}
              >
                Book Appointment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindClinics;