import { useEffect, useState } from "react";
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

type Clinic = { clinic_id: number; name: string; address?: string; rating?: number; contact?: string; consultation_fee?: number };

const FindClinics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listClinics({ q: searchQuery || undefined });
        setClinics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load clinics");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Find Clinics Near You</h1>
          <p className="text-muted-foreground">
            Discover verified healthcare facilities in your area
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Search & Filters</h2>

              {/* Location */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your location"
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
              </div>

              {/* Search */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Clinic name or service"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Specialty</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="general">General Practice</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Availability</label>
                <Select defaultValue="any">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="today">Available Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Distance</label>
                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                    <SelectItem value="20">Within 20 km</SelectItem>
                    <SelectItem value="50">Within 50 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="hero" className="w-full mt-6">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map Placeholder */}
            <div className="bg-card rounded-xl h-64 flex items-center justify-center border border-border shadow-soft overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
              <div className="relative z-10 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Interactive Map View</p>
                <p className="text-sm text-muted-foreground">
                  {clinics.length} clinics found
                </p>
              </div>
            </div>

            {/* Clinic Cards */}
            <div className="space-y-4">
              {clinics.map((clinic, index) => (
                <div
                  key={clinic.clinic_id}
                  className="bg-card rounded-xl p-6 shadow-soft border border-border hover-lift group"
                  style={{
                    animation: "fade-in 0.5s ease-out",
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Clinic Image/Icon */}
                    <div
                      className={`bg-gradient-primary rounded-lg w-full md:w-24 h-24 flex-shrink-0 flex items-center justify-center`}
                    >
                      <MapPin className="h-10 w-10 text-primary-foreground" />
                    </div>

                    {/* Clinic Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                            {clinic.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {clinic.address || 'Address not provided'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            (clinic.rating || 0) >= 4.5
                              ? "default"
                              : "secondary"
                          }
                          className="whitespace-nowrap"
                        >
                          {typeof clinic.rating === 'number' ? `${clinic.rating.toFixed(1)} ★` : 'No rating'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-semibold">{typeof clinic.rating === 'number' ? clinic.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Consultation: {typeof clinic.consultation_fee === 'number' ? `$${clinic.consultation_fee}` : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="hero" size="sm">
                          Book Appointment
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
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
