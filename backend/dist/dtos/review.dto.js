"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReviewDTO = toReviewDTO;
function toReviewDTO(r) {
    return {
        review_id: r.id,
        user_id: r.userId,
        clinic_id: r.clinicId,
        rating: r.rating,
        comment: r.comment,
    };
}
//# sourceMappingURL=review.dto.js.map