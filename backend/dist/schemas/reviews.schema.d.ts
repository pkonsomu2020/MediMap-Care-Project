import { z } from 'zod';
export declare const CreateReviewInput: z.ZodObject<{
    user_id: z.ZodNumber;
    clinic_id: z.ZodNumber;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
<<<<<<< HEAD
}, z.core.$strip>;
=======
}, "strip", z.ZodTypeAny, {
    user_id: number;
    clinic_id: number;
    rating: number;
    comment?: string | undefined;
}, {
    user_id: number;
    clinic_id: number;
    rating: number;
    comment?: string | undefined;
}>;
>>>>>>> vector_search
//# sourceMappingURL=reviews.schema.d.ts.map