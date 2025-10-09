import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Phone, Video, X, Check, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type Appointment = {
  appointment_id: number;
  user_id: number;
  clinic_id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  clinics: {
    clinic_id: number;
    name: string;
    address?: string;
    contact?: string;
  };
};

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

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

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await api.updateAppointment(appointmentId, { status: 'cancelled' });
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.appointment_id === appointmentId
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel appointment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (appointmentId: number) => {
    try {
      await api.updateAppointment(appointmentId, { status: 'completed' });
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.appointment_id === appointmentId
            ? { ...apt, status: 'completed' as const }
            : apt
        )
      );
      toast({
        title: "Appointment completed",
        description: "Your appointment has been marked as completed.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete appointment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleDialog.appointment || !rescheduleData.date || !rescheduleData.time) return;

    try {
      await api.updateAppointment(rescheduleDialog.appointment.appointment_id, {
        date: rescheduleData.date,
        time: rescheduleData.time
      });
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.appointment_id === rescheduleDialog.appointment!.appointment_id
            ? { ...apt, date: rescheduleData.date, time: rescheduleData.time }
            : apt
        )
      );
      setRescheduleDialog({ open: false, appointment: null });
      setRescheduleData({ date: '', time: '' });
      toast({
        title: "Appointment rescheduled",
        description: "Your appointment has been rescheduled successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reschedule appointment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setRescheduleDialog({ open: true, appointment });
    setRescheduleData({ date: appointment.date, time: appointment.time });
  };

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
                {appointment.clinics.name}
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
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{appointment.clinics.address || 'Address not available'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {(appointment.status === "confirmed" || appointment.status === "pending") && (
              <>
                <Button variant="outline" size="sm" onClick={() => openRescheduleDialog(appointment)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleCancelAppointment(appointment.appointment_id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCompleteAppointment(appointment.appointment_id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </>
            )}
            {appointment.status === "completed" && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/reviews?clinicId=${appointment.clinic_id}`)}>
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
            <Link to="/dashboard/find-clinics">
              <Button variant="hero">
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>
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

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ open, appointment: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Update the date and time for your appointment with {rescheduleDialog.appointment?.clinics.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog({ open: false, appointment: null })}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleAppointment}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
