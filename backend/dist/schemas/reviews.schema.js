"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewInput = void 0;
const zod_1 = require("zod");
exports.CreateReviewInput = zod_1.z.object({
    user_id: zod_1.z.number().int(),
    clinic_id: zod_1.z.number().int(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
//# sourceMappingURL=reviews.schema.js.map