import {Review} from '../models/models';

export function toReviewDTO(r: Review) {
  return {
    review_id: r.id,
    user_id: r.userId,
    clinic_id: r.clinicId,
    rating: r.rating,
    comment: r.comment,
  };
}


