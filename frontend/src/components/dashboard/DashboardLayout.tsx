import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, NavLink } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Map,
  Star,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  Siren,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { APIProvider } from "@vis.gl/react-google-maps";
import { config } from "@/config/environment";

type User = {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type Appointment = {
  appointment_id: number;
  date: string;
  time: string;
  status: string;
  clinic_name?: string;
};

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        setNotificationsLoading(true);
        // Fetch user's appointments to generate notifications
        const appointments = await api.listAppointments?.() || [];
        
        const now = new Date();
        const upcomingAppointments = appointments.filter((apt: Appointment) => {
          const aptDateTime = new Date(`${apt.date}T${apt.time}:00`);
          return aptDateTime > now && apt.status === 'pending';
        });

        const realNotifications: Notification[] = upcomingAppointments.map((apt: Appointment) => ({
          id: apt.appointment_id,
          title: "Appointment Reminder",
          message: `Your appointment at ${apt.clinic_name || 'the clinic'} on ${format(new Date(apt.date), 'MMM dd')} at ${apt.time}`,
          time: format(new Date(apt.date), 'MMM dd, yyyy'),
          unread: true,
        }));

        setNotifications(realNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        // Fallback to empty array or handle error
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const navItems = [
    { name: "Find Clinics", path: "/dashboard/find-clinics", icon: Map },
    { name: "Emergency", path: "/dashboard/emergency", icon: Siren },
    {
      name: "My Appointments",
      path: "/dashboard/appointments",
      icon: Calendar,
    },
    { name: "Clinic Directory", path: "/dashboard/directory", icon: MapPin },
    { name: "Reviews", path: "/dashboard/reviews", icon: Star },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    // Clear token and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <APIProvider apiKey={config.googleMapsApiKey} libraries={['geometry','places']}>
      <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 w-64
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.svg"
                alt="MediMap Care Logo"
                className="h-7 w-7 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-bold text-gradient">MediMap Care</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none"></div>

            <div className="flex items-center gap-4">
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Notifications</h4>
                      <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                        Mark all read
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No new notifications
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/5 ${
                              notification.unread ? "bg-accent/10 border-accent" : "bg-muted/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{notification.title}</h5>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-3">
                <Link to="/dashboard/profile">
                  <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                      {userLoading ? ".." : user ? getInitials(user.name) : "??"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </APIProvider>
  );
};

export default DashboardLayout;
