import { Calendar, Clock, MapPin, Phone, Video, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock appointments data
const mockAppointments = {
  upcoming: [
    {
      id: 1,
      clinic: "City Care Clinic",
      doctor: "Dr. Sarah Johnson",
      specialty: "General Practice",
      date: "2025-10-10",
      time: "10:00 AM",
      type: "In-person",
      address: "123 Main St, Downtown",
      phone: "+1 (555) 123-4567",
      status: "confirmed",
    },
    {
      id: 2,
      clinic: "HealthFirst Medical",
      doctor: "Dr. Michael Chen",
      specialty: "Cardiology",
      date: "2025-10-12",
      time: "2:30 PM",
      type: "Video",
      address: "Online Consultation",
      phone: "+1 (555) 234-5678",
      status: "confirmed",
    },
  ],
  past: [
    {
      id: 3,
      clinic: "Wellness Clinic",
      doctor: "Dr. Emily Brown",
      specialty: "Pediatrics",
      date: "2025-09-28",
      time: "11:00 AM",
      type: "In-person",
      address: "789 Pine Rd, Uptown",
      phone: "+1 (555) 345-6789",
      status: "completed",
    },
  ],
  cancelled: [
    {
      id: 4,
      clinic: "Family Health",
      doctor: "Dr. Robert Lee",
      specialty: "Dermatology",
      date: "2025-09-25",
      time: "3:00 PM",
      type: "In-person",
      address: "321 Elm St, Westside",
      phone: "+1 (555) 456-7890",
      status: "cancelled",
    },
  ],
};

const Appointments = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border hover-lift">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {appointment.clinic}
              </h3>
              <p className="text-sm text-muted-foreground">
                {appointment.doctor} • {appointment.specialty}
              </p>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{appointment.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {appointment.type === "Video" ? (
                <Video className="h-4 w-4 text-primary" />
              ) : (
                <Phone className="h-4 w-4 text-primary" />
              )}
              <span>{appointment.type} Consultation</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {appointment.status === "confirmed" && (
              <>
                {appointment.type === "Video" ? (
                  <Button variant="hero" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Join Video Call
                  </Button>
                ) : (
                  <Button variant="hero" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === "completed" && (
              <Button variant="outline" size="sm">
                Leave Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
              <p className="text-muted-foreground">
                Manage your healthcare appointments
              </p>
            </div>
            <Button variant="hero">
              <Calendar className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Upcoming ({mockAppointments.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Past ({mockAppointments.past.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Cancelled ({mockAppointments.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {mockAppointments.upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {mockAppointments.past.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {mockAppointments.cancelled.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;
