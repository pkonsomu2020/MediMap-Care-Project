import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Phone, Globe, Clock, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Booking state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);

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

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleBookAppointment = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setBookingDate(undefined);
    setBookingTime("");
    setBookingDialogOpen(true);
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

  const handleViewProfile = (clinic: Clinic) => {
    navigate(`/dashboard/clinic/${clinic.clinic_id}`);
  };

  const handleGetDirections = (clinic: Clinic) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
    window.open(url, '_blank');
  };

  const handleCall = (clinic: Clinic) => {
    if (clinic.contact) {
      window.open(`tel:${clinic.contact}`);
    } else {
      toast({
        title: "Contact not available",
        description: "This clinic doesn't have a phone number listed.",
        variant: "destructive",
      });
    }
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
                        <Button variant="hero" size="sm" onClick={() => handleBookAppointment(clinic)}>
                          Book Appointment
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewProfile(clinic)}>
                          View Profile
                        </Button>
                        {clinic.contact && (
                          <Button variant="ghost" size="sm" onClick={() => handleCall(clinic)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleGetDirections(clinic)}>
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
    </div>
  );
};

export default Directory;
