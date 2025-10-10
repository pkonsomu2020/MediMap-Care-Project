import {
  MapPin,
  Calendar,
  Star,
  Shield,
  Clock,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Find Nearby Clinics",
    description:
      "Discover verified healthcare facilities in your area with real-time location tracking and interactive maps.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description:
      "Book appointments in seconds with real-time availability and instant confirmation notifications.",
    color: "secondary",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description:
      "Read authentic patient reviews and ratings to make informed healthcare decisions.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your health data is protected with enterprise-grade security and HIPAA compliance.",
    color: "info",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description:
      "Browse clinics and book appointments anytime, anywhere, from any device.",
    color: "primary",
  },
  {
    icon: Heart,
    title: "Quality Care",
    description:
      "Access only verified healthcare providers committed to excellent patient care.",
    color: "success",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need for
            <span className="text-gradient block">Better Healthcare</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We've built the most comprehensive platform to connect you with
            quality healthcare providers in your area.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-card rounded-2xl p-8 shadow-soft hover-lift border border-border"
                style={{
                  animation: "fade-in 0.6s ease-out",
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: "both",
                }}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${feature.color}/10 mb-6 group-hover:shadow-glow transition-all duration-300`}
                >
                  <Icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
