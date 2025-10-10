import { z } from 'zod';
export declare const CreateAppointmentInput: z.ZodObject<{
    user_id: z.ZodNumber;
    clinic_id: z.ZodNumber;
    date: z.ZodString;
    time: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "cancelled"]>>;
}, "strip", z.ZodTypeAny, {
    user_id: number;
    date: string;
    time: string;
    clinic_id: number;
    status?: "pending" | "confirmed" | "cancelled" | undefined;
}, {
    user_id: number;
    date: string;
    time: string;
    clinic_id: number;
    status?: "pending" | "confirmed" | "cancelled" | undefined;
}>;
export declare const UpdateAppointmentInput: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "cancelled"]>>;
    date: z.ZodOptional<z.ZodString>;
    time: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "confirmed" | "cancelled" | undefined;
    date?: string | undefined;
    time?: string | undefined;
}, {
    status?: "pending" | "confirmed" | "cancelled" | undefined;
    date?: string | undefined;
    time?: string | undefined;
}>;
//# sourceMappingURL=appointments.schema.d.ts.map