import Review from '../models/review';

export function toReviewDTO(r: Review) {
  return {
    review_id: r.id,
    user_id: r.userId,
    clinic_id: r.clinicId,
    rating: r.rating,
    comment: r.comment,
  };
}


