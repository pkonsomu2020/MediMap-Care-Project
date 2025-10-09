import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

type Review = {
  review_id: number;
  user_id: number;
  clinic_id: number;
  rating: number;
  comment?: string;
  created_at: string;
};

type Clinic = {
  clinic_id: number;
  name: string;
};

const Reviews = () => {
  const [searchParams] = useSearchParams();
  const clinicIdParam = searchParams.get("clinicId");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(clinicIdParam ? parseInt(clinicIdParam) : null);
  const [newReview, setNewReview] = useState({
    clinic_id: clinicIdParam || "",
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const data = await api.listClinics();
        setClinics(data);
        if (!selectedClinicId && data.length > 0) {
          setSelectedClinicId(data[0].clinic_id);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load clinics";
        setError(errorMessage);
      }
    };
    loadClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      loadReviews(selectedClinicId);
    }
  }, [selectedClinicId]);

  const loadReviews = async (clinicId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listReviewsByClinic(clinicId);
      setReviews(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load reviews";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.clinic_id || newReview.rating === 0) return;

    try {
      await api.createReview({
        clinic_id: parseInt(newReview.clinic_id),
        rating: newReview.rating,
        comment: newReview.comment || undefined,
      });
      setNewReview({ clinic_id: "", rating: 0, comment: "" });
      // Reload reviews for the selected clinic
      if (selectedClinicId) {
        loadReviews(selectedClinicId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit review";
      setError(errorMessage);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-accent text-accent"
            : "fill-muted text-muted-foreground"
        }`}
      />
    ));
  };

  const getClinicName = (clinicId: number) => {
    const clinic = clinics.find(c => c.clinic_id === clinicId);
    return clinic?.name || `Clinic #${clinicId}`;
  };

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Reviews</h1>
          <p className="text-muted-foreground">
            Share your experience and read others' feedback
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Write Review */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-2">
                  <Label>Clinic</Label>
                  <Select value={newReview.clinic_id} onValueChange={(value) => setNewReview(prev => ({ ...prev, clinic_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.clinic_id} value={clinic.clinic_id.toString()}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${i < newReview.rating ? "fill-accent text-accent" : "fill-muted text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review">Your Review</Label>
                  <Textarea
                    id="review"
                    placeholder="Share your experience with the clinic..."
                    rows={5}
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </div>

                <Button variant="hero" className="w-full" type="submit">
                  Submit Review
                </Button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clinic Selector */}
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
              <Label className="text-base font-semibold">Select Clinic to View Reviews</Label>
              <Select value={selectedClinicId?.toString()} onValueChange={(value) => setSelectedClinicId(parseInt(value))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.clinic_id} value={clinic.clinic_id.toString()}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-4" />
                <span>Loading reviews...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => selectedClinicId && loadReviews(selectedClinicId)}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Reviews */}
            {!loading && !error && (
              <>
                {reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reviews yet for this clinic</p>
                ) : (
                  reviews.map((review, index) => (
                    <div
                      key={review.review_id}
                      className="bg-card rounded-xl p-6 shadow-soft border border-border"
                      style={{
                        animation: "fade-in 0.5s ease-out",
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: "both",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                            U{review.user_id}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">User #{review.user_id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {getClinicName(review.clinic_id)}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 mb-3">
                            {renderStars(review.rating)}
                          </div>

                          {review.comment && (
                            <p className="text-foreground mb-4">{review.comment}</p>
                          )}

                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Helpful
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
