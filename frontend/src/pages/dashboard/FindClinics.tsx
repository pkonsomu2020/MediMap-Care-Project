import { useEffect, useState } from "react";
import { Search, MapPin, Star, Clock, Phone, Navigation, Calendar as CalendarIcon } from "lucide-react";
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

type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  rating?: number;
  contact?: string;
  consultation_fee?: number;
};

const FindClinics = () => {
  // Search UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsClinic, setDetailsClinic] = useState<Clinic | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
  const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listClinics({ q: searchQuery || undefined });
        setClinics(data);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load clinics");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookAppointment = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setBookingDate(undefined);
    setBookingTime("");
    setBookingDialogOpen(true);
  };

  const handleViewDetails = (clinic: Clinic) => {
    setDetailsClinic(clinic);
    setDetailsDialogOpen(true);
  };

  const handleCall = (clinic: Clinic) => {
    if (clinic.contact) {
      window.location.href = `tel:${clinic.contact}`;
    } else {
      toast({
        title: "Contact not available",
        description: "This clinic doesn't have a phone number listed.",
        variant: "destructive",
      });
    }
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
        clinic_id: selectedClinic.clinic_id,
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
              <h2 className="font-semibold text-lg mb-4">Search & Filters</h2>

              {/* Location input + actions */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Location</label>
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
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={handleUseMyLocation} variant="outline" size="sm">
                    <Navigation className="h-4 w-4 mr-2" />
                    My Location
                  </Button>
                  <Button
                    onClick={() => {
                      if (userLocation) {
                        reverseGeocode(userLocation).catch(() => {});
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    disabled={!userLocation}
                  >
                    Reverse Geocode
                  </Button>
                </div>
              </div>

              {/* Radius controls */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Radius</label>
                <RadiusControls
                  radiusKm={radiusKm}
                  setRadiusKm={setRadiusKm}
                  radiusMode={radiusMode}
                  setRadiusMode={setRadiusMode}
                  disabled={!hasUserLocation}
                />
              </div>

              {/* Specialty (types) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
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
                  className="bg-card rounded-xl p-6 shadow-soft border border-border flex gap-4 items-start"
                >
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
                          <span className="truncate">
                            {clinic.raw?.address || clinic.raw?.formattedAddress || "Address unavailable"}
                          </span>
                          {/* distance (approx) */}
                          {clinic.position && userLocation && (
                            <span className="ml-3 text-muted-foreground">
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

                      <div className="text-sm text-right">
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

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="font-medium">
                          {typeof clinic.rating === "number" ? clinic.rating.toFixed(1) : "N/A"}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          ({clinic.raw?.userRatingCount || clinic.raw?.reviews_count || 0} reviews)
                        </span>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-muted/50 text-sm">
                        {clinic.raw?.category || clinic.raw?.types?.[0] || "General"}
                      </div>

                      {(clinic.distanceText || clinic.durationText) && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {clinic.distanceText || "--"} • {clinic.durationText || "--"}
                          </span>
                        </div>
                      )}
                    </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => handleBookAppointment(clinic)}
                        >
                          Book Appointment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(clinic)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCall(clinic)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
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
                  {detailsClinic.address || 'Address not provided'}
                </p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Contact</label>
                <p className="text-sm text-muted-foreground">
                  {detailsClinic.contact || 'Contact information not available'}
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

              <div className="grid gap-2">
                <label className="text-sm font-medium">Consultation Fee</label>
                <p className="text-sm text-muted-foreground">
                  {typeof detailsClinic.consultation_fee === 'number' ? `$${detailsClinic.consultation_fee}` : 'Not specified'}
                </p>
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