import { z } from 'zod';
export declare const CreateAppointmentInput: z.ZodObject<{
    user_id: z.ZodNumber;
    clinic_id: z.ZodNumber;
    date: z.ZodString;
    time: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        confirmed: "confirmed";
        cancelled: "cancelled";
    }>>;
}, z.core.$strip>;
export declare const UpdateAppointmentInput: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        confirmed: "confirmed";
        cancelled: "cancelled";
    }>>;
    date: z.ZodOptional<z.ZodString>;
    time: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=appointments.schema.d.ts.map