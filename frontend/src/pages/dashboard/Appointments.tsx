import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Phone, Video, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

type Appointment = {
  appointment_id: number;
  user_id: number;
  clinic_id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listAppointments();
        setAppointments(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load appointments";
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          setError("Please log in to view your appointments");
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);
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

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border hover-lift">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Clinic #{appointment.clinic_id}
              </h3>
              <p className="text-sm text-muted-foreground">
                Appointment #{appointment.appointment_id}
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
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {appointment.status === "confirmed" && (
              <>
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

  if (loading) {
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes("Please log in");
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          {isAuthError ? (
            <Link to="/login">
              <Button variant="hero">
                Log In
              </Button>
            </Link>
          ) : (
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

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
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Past ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No past appointments</p>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No cancelled appointments</p>
            ) : (
              cancelledAppointments.map((appointment) => (
                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;
