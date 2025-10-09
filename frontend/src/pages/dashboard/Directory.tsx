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
  rating?: number;
  contact?: string;
  services?: string;
  reviews_count?: number;
};

const Directory = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const data = await api.listClinics();
        setClinics(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch clinics");
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

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
                placeholder="Search clinics by name, specialty, or location..."
                className="pl-10"
              />
            </div>
            <Button variant="hero">Search</Button>
          </div>
        </div>

        {/* Directory List */}
        {loading && <p>Loading clinics...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-6">
          {clinics.map((clinic, index) => (
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
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-semibold">{clinic.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({clinic.reviews_count || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <span>{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{clinic.contact}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {clinic.services?.split(",").map((service) => (
                        <Badge key={service} variant="secondary">
                          {service.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="hero" size="sm">
                      Book Appointment
                    </Button>
                    <Link to={`/dashboard/clinic/${clinic.clinic_id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Directory;
