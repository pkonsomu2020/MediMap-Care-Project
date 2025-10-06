import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-hero rounded-3xl p-12 md:p-16 text-center shadow-large">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 animate-float">
            <img 
              src="/logo.svg" 
              alt="MediMap Care Logo" 
              className="h-12 w-12"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Find Your Healthcare Provider?
          </h2>

          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their healthcare journey
            with MediMap Care. Start booking appointments today!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                variant="secondary"
                size="xl"
                className="shadow-large hover:shadow-glow"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard/find-clinics">
              <Button
                variant="outline"
                size="xl"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground shadow-large"
              >
                Explore Clinics
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/20">
            <div>
              <div className="text-4xl font-bold text-primary-foreground mb-2">
                500+
              </div>
              <div className="text-sm text-primary-foreground/80">
                Verified Clinics
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-foreground mb-2">
                10K+
              </div>
              <div className="text-sm text-primary-foreground/80">
                Happy Patients
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-foreground mb-2">
                4.8★
              </div>
              <div className="text-sm text-primary-foreground/80">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
