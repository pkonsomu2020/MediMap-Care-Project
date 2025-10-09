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
  const [searchQuery, setSearchQuery] = useState("");
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
