<<<<<<< HEAD
import { Review } from '../models/models';
export declare function toReviewDTO(r: Review): {
    review_id: string;
    user_id: string;
    clinic_id: string;
=======
import Review from '../models/review';
export declare function toReviewDTO(r: Review): {
    review_id: number;
    user_id: number;
    clinic_id: number;
>>>>>>> vector_search
    rating: number;
    comment: string | null;
};
//# sourceMappingURL=review.dto.d.ts.map