import { z } from 'zod';
export declare const RegisterInput: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        user: "user";
        clinic: "clinic";
        admin: "admin";
    }>>;
}, z.core.$strip>;
export declare const LoginInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const UserUpdateInput: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    emergency_contact: z.ZodOptional<z.ZodString>;
    medical_info: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=users.schema.d.ts.map