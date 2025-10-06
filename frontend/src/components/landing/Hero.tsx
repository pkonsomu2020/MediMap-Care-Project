import { MapPin, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Healthcare Made Simple
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find Quality
              <span className="text-gradient block">Healthcare Near You</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Discover verified clinics in your area and book appointments
              instantly. Skip the queues, save time, and get the care you
              deserve—all in one simple platform.
            </p>

            {/* Search Bar */}
            <div className="bg-card p-2 rounded-xl shadow-large border border-border max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by location, clinic, or service..."
                    className="pl-10 border-0 bg-muted/50 focus-visible:ring-0 h-12"
                  />
                </div>
                <Link to="/dashboard/find-clinics">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    <MapPin className="mr-2 h-5 w-5" />
                    Find Clinics
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Verified Clinics
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Patients
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Support Available
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative h-[500px] hidden lg:block">
            {/* Main Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-card rounded-2xl shadow-large p-6 border border-border animate-float">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <span className="bg-success/10 text-success text-xs font-medium px-3 py-1 rounded-full">
                  Available
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">City Care Clinic</h3>
              <p className="text-sm text-muted-foreground mb-4">
                General Practice • 2.5km away
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-card"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    +120
                  </span>
                </div>
                <Button size="sm" variant="hero">
                  Book Now
                </Button>
              </div>
            </div>

            {/* Floating Badge 1 */}
            <div
              className="absolute top-20 right-10 bg-card rounded-xl shadow-medium p-4 border border-border"
              style={{ animation: "float 8s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse-slow"></div>
                <span className="text-sm font-medium">1,234 appointments today</span>
              </div>
            </div>

            {/* Floating Badge 2 */}
            <div
              className="absolute bottom-20 left-10 bg-card rounded-xl shadow-medium p-4 border border-border"
              style={{
                animation: "float 7s ease-in-out infinite",
                animationDelay: "1s",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-sm font-semibold">4.8/5</div>
                  <div className="text-xs text-muted-foreground">
                    Average Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
