import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Star, MapPin } from "lucide-react";

type Review = {
  review_id: number;
  rating: number;
  comment: string;
  created_at: string;
};

type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  rating?: number;
  reviews: Review[];
};

const ClinicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinicDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getClinic(parseInt(id));
        setClinic(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch clinic details");
      } finally {
        setLoading(false);
      }
    };
    fetchClinicDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!clinic) return <p>Clinic not found.</p>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
        <h1 className="text-3xl font-bold mb-2">{clinic.name}</h1>
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{clinic.address}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-amber-500" />
          <span className="font-bold text-xl">{clinic.rating?.toFixed(1)}</span>
          <span className="text-muted-foreground">({clinic.reviews.length} reviews)</span>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Reviews</h2>
        <div className="space-y-4">
          {clinic.reviews.map((review) => (
            <div key={review.review_id} className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < review.rating ? 'text-amber-500' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicProfile;