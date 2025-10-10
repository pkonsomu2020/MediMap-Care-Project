import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Phone, Globe, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  services?: string;
  consultation_fee?: number;
  contact?: string;
  rating?: number;
};

const Directory = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listClinics();
        setClinics(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load clinics";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadClinics();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listClinics({ q: searchQuery });
      setClinics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search clinics";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-accent text-accent"
            : "fill-muted text-muted-foreground"
        }`}
      />
    ));
  };
  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Clinic Directory</h1>
          <p className="text-muted-foreground">
            Browse all verified healthcare facilities
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search clinics by name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="hero" onClick={handleSearch}>Search</Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-4" />
            <span>Loading clinics...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Directory List */}
        {!loading && !error && (
          <div className="grid gap-6">
            {clinics.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No clinics found</p>
            ) : (
              clinics.map((clinic, index) => (
                <div
                  key={clinic.clinic_id}
                  className="bg-card rounded-xl p-6 shadow-soft border border-border hover-lift"
                  style={{
                    animation: "fade-in 0.5s ease-out",
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Clinic Icon */}
                    <div className="bg-gradient-primary rounded-xl w-20 h-20 flex-shrink-0 flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-primary-foreground" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-semibold mb-2">
                          {clinic.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {clinic.rating && (
                            <>
                              <div className="flex items-center gap-1">
                                {renderStars(clinic.rating)}
                              </div>
                              <span className="font-semibold">{clinic.rating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {clinic.address && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary mt-0.5" />
                            <span>{clinic.address}</span>
                          </div>
                        )}
                        {clinic.contact && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{clinic.contact}</span>
                          </div>
                        )}
                        {clinic.consultation_fee && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>${clinic.consultation_fee} consultation fee</span>
                          </div>
                        )}
                      </div>

                      {clinic.services && (
                        <div>
                          <p className="text-sm font-medium mb-2">Services:</p>
                          <p className="text-sm text-muted-foreground">{clinic.services}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button variant="hero" size="sm">
                          Book Appointment
                        </Button>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="ghost" size="sm">
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;
