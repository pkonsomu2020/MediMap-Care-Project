import { Search, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search for Clinics",
    description:
      "Use your location or search manually to find verified clinics near you. Filter by specialty, ratings, and distance.",
    step: "01",
  },
  {
    icon: Calendar,
    title: "Book Appointment",
    description:
      "Choose your preferred time slot from available options. Get instant confirmation via email and SMS.",
    step: "02",
  },
  {
    icon: CheckCircle,
    title: "Get Quality Care",
    description:
      "Visit the clinic at your scheduled time. After your visit, share your experience to help others.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20 mb-4">
            <span className="text-sm font-medium text-secondary">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How MediMap Care
            <span className="text-gradient block">Works For You</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting quality healthcare has never been easier. Just three simple
            steps to better health.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
                style={{
                  animation: "scale-in 0.6s ease-out",
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: "both",
                }}
              >
                {/* Connector Line (hidden on mobile, last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-secondary opacity-20"></div>
                )}

                <div className="relative bg-card rounded-2xl p-8 shadow-medium hover-lift border border-border text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-6 group-hover:shadow-glow transition-all duration-300">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
