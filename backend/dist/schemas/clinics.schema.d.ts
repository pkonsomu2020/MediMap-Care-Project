import { z } from 'zod';
export declare const CreateClinicInput: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    latitude: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    longitude: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    services: z.ZodOptional<z.ZodString>;
    consultation_fee: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    contact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const QueryClinicsInput: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    min_rating: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=clinics.schema.d.ts.map