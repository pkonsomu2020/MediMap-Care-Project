import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import FindClinics from "./pages/dashboard/FindClinics";
import Appointments from "./pages/dashboard/Appointments";
import Directory from "./pages/dashboard/Directory";
import Reviews from "./pages/dashboard/Reviews";
import Profile from "./pages/dashboard/Profile";
import ClinicProfile from "./pages/dashboard/ClinicProfile";
import Emergency from "./pages/dashboard/Emergency";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="find-clinics" element={<FindClinics />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="directory" element={<Directory />} />
            <Route path="clinic/:id" element={<ClinicProfile />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
