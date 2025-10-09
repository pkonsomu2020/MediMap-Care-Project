// frontend/src/pages/dashboard/FindClinics.tsx
import { useEffect, useState, useCallback } from "react";
import { Search, MapPin, Star, Clock, Phone, Navigation } from "lucide-react";
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
import { api } from "@/lib/api";
import MapComponent from "@/components/dashboard/MapComponent"; // Import the map component

// Expanded Clinic type to include latitude and longitude
type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  rating?: number;
  contact?: string;
  consultation_fee?: number;
  latitude: number;
  longitude: number;
  reviews_count?: number;
  comments?: any[];
};

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

const FindClinics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

  // Function to get user's current location
  const handleUseMyLocation = () => {
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
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearch = async () => {
    if (!locationQuery) return;
    try {
      setLoading(true);
      setError(null);
      const location = await api.geocodeAddress(locationQuery);
      setUserLocation(location);
    } catch (err: any) {
      setError(err.message || "Failed to find location");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverClinics = useCallback(async () => {
    if (!userLocation) {
      return;
    }
    try {
      setIsDiscovering(true);
      setError(null);
      const response = await api.searchNearbyPlaces(userLocation);
      setClinics(response.clinics);
    } catch (err: any) {
      setError(err.message || "Failed to discover clinics");
    } finally {
      setIsDiscovering(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation) {
      handleDiscoverClinics();
    }
  }, [userLocation, handleDiscoverClinics]);

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        {/* ... (header content remains the same) */}
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Search & Filters</h2>

              {/* ... (other filters remain the same) */}
              
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your location"
                    className="pl-10"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} size="sm" className="w-full mt-2">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button onClick={handleUseMyLocation} variant="outline" size="sm" className="w-full mt-2">
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
                <Button onClick={handleDiscoverClinics} disabled={isDiscovering} size="sm" className="w-full mt-2">
                  <Search className="h-4 w-4 mr-2" />
                  {isDiscovering ? 'Discovering...' : 'Discover Nearby'}
                </Button>
              </div>

              {/* ... (rest of the filters) */}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Replace the Map Placeholder with the actual Map Component */}
            <div className="bg-card rounded-xl h-96 flex items-center justify-center border border-border shadow-soft overflow-hidden relative">
              {loading ? (
                <p>Loading map...</p>
              ) : (
                <MapComponent clinics={clinics} userLocation={userLocation} />
              )}
            </div>

            {/* Clinic Cards */}
            <div className="space-y-4">
              {clinics.map((clinic) => (
                <div key={clinic.clinic_id} className="bg-card rounded-xl p-6 shadow-soft border border-border flex gap-4 items-start">
                  {/* Left icon / avatar box */}
                  <div className="flex-shrink-0 rounded-lg w-20 h-20 bg-primary/10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center text-white">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{clinic.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{clinic.address}</span>
                          {/* distance placeholder if coordinates available */}
                          {clinic.latitude && clinic.longitude && userLocation && (
                            <span className="ml-3 text-muted-foreground">• {computeDistanceKm(userLocation.lat, userLocation.lng, clinic.latitude, clinic.longitude).toFixed(1)} km</span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs">Available Today</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="font-medium">{clinic.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="ml-2 text-muted-foreground">({clinic.reviews_count || 0} reviews)</span>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-muted/50 text-sm">General Practice</div>

                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Consultation: ${clinic.consultation_fee ?? '—'}</span>
                      </div>
                    </div>

                    {clinic.comments && clinic.comments.length > 0 && (
                      <div className="text-sm text-muted-foreground border-t border-border pt-3 mt-3 space-y-3">
                        {clinic.comments.map((comment: any, index: number) => (
                          <div key={index}>
                            <p className="font-medium text-foreground mb-1">"{comment.text}"</p>
                            <p className="text-xs">- {comment.authorAttribution.name}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        Book Appointment
                      </Button>
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindClinics;