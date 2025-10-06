import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const mockReviews = [
  {
    id: 1,
    clinic: "City Care Clinic",
    author: "John Doe",
    rating: 5,
    date: "2025-09-28",
    comment:
      "Excellent service! The staff was very professional and the doctor took time to explain everything thoroughly.",
    helpful: 12,
  },
  {
    id: 2,
    clinic: "HealthFirst Medical",
    author: "Jane Smith",
    rating: 4,
    date: "2025-09-25",
    comment:
      "Great facility with modern equipment. Wait time was a bit long but overall good experience.",
    helpful: 8,
  },
  {
    id: 3,
    clinic: "Wellness Clinic",
    author: "Mike Johnson",
    rating: 5,
    date: "2025-09-20",
    comment:
      "Dr. Brown was amazing with my kids. Very patient and caring. Highly recommend!",
    helpful: 15,
  },
];

const Reviews = () => {
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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className="hover:scale-110 transition-transform"
                      >
                        <Star className="h-6 w-6 fill-muted text-muted-foreground hover:fill-accent hover:text-accent" />
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
                  />
                </div>

                <Button variant="hero" className="w-full">
                  Submit Review
                </Button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {mockReviews.map((review, index) => (
              <div
                key={review.id}
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
                      {review.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{review.author}</h3>
                        <p className="text-sm text-muted-foreground">
                          {review.clinic}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {review.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-foreground mb-4">{review.comment}</p>

                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Helpful ({review.helpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
