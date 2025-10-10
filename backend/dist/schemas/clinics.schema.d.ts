import { z } from 'zod';
export declare const CreateClinicInput: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    latitude: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    longitude: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    services: z.ZodOptional<z.ZodString>;
    consultation_fee: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    contact: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    latitude: string | number;
    longitude: string | number;
    address?: string | undefined;
    services?: string | undefined;
    consultation_fee?: string | number | undefined;
    contact?: string | undefined;
}, {
    name: string;
    latitude: string | number;
    longitude: string | number;
    address?: string | undefined;
    services?: string | undefined;
    consultation_fee?: string | number | undefined;
    contact?: string | undefined;
}>;
export declare const QueryClinicsInput: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    min_rating: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
    min_rating?: string | undefined;
    limit?: string | undefined;
    offset?: string | undefined;
}, {
    q?: string | undefined;
    min_rating?: string | undefined;
    limit?: string | undefined;
    offset?: string | undefined;
}>;
//# sourceMappingURL=clinics.schema.d.ts.map