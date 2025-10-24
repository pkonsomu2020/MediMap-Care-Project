import { z } from 'zod';
export declare const CreateReviewInput: z.ZodObject<{
    user_id: z.ZodNumber;
    clinic_id: z.ZodNumber;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=reviews.schema.d.ts.map