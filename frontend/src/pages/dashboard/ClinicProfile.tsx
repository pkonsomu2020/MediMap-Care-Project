import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Clock, Phone, Route, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Clinic {
  clinic_id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  services?: string;
  consultation_fee?: number;
  contact?: string;
  rating: number;
}

interface Review {
  review_id: number;
  user_id: number;
  clinic_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

const ClinicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchClinicData = async () => {
      if (!id) return;
      try {
        const clinicData = await api.getClinic(Number(id));
        setClinic(clinicData);
        const reviewsData = await api.listReviewsByClinic(Number(id));
        setReviews(reviewsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clinic details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClinicData();
  }, [id, toast]);

  const handleBookAppointment = () => {
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!clinic || !bookingDate || !bookingTime) {
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
        clinic_id: clinic.clinic_id,
        date: format(bookingDate, "yyyy-MM-dd"),
        time: bookingTime,
        status: "pending" as const,
      };

      await api.createAppointment(appointmentData);

      toast({
        title: "Appointment booked!",
        description: `Your appointment at ${clinic.name} has been scheduled.`,
      });

      setBookingDialogOpen(false);
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

  const handleGetDirections = () => {
    // For now, just show a toast; in a real app, integrate with maps
    toast({
      title: "Directions",
      description: `Directions to ${clinic?.name} would open here.`,
    });
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  if (loading) {
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <div>Loading clinic details...</div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <div>Clinic not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{clinic.name}</h1>
              <p className="text-muted-foreground text-sm">
                Clinic profile and details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Clinic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{clinic.name}</h3>
                  <p className="text-muted-foreground">{clinic.address}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-1 text-amber-500" />
                    <span>{clinic.rating.toFixed(1)}</span>
                  </div>
                  {clinic.contact && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{clinic.contact}</span>
                    </div>
                  )}
                  {clinic.consultation_fee && (
                    <Badge variant="secondary">
                      Fee: ${clinic.consultation_fee}
                    </Badge>
                  )}
                </div>
                {clinic.services && (
                  <div>
                    <h4 className="font-medium mb-2">Services</h4>
                    <p className="text-sm text-muted-foreground">{clinic.services}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.review_id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.created_at), "PPP")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleBookAppointment}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGetDirections}
                >
                  <Route className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                {clinic.contact && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => window.open(`tel:${clinic.contact}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment at {clinic.name}
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

export default ClinicProfile;
