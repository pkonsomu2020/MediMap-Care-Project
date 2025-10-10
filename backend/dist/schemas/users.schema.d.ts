import { z } from 'zod';
export declare const RegisterInput: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["user", "clinic", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    role?: "user" | "clinic" | "admin" | undefined;
}, {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    role?: "user" | "clinic" | "admin" | undefined;
}>;
export declare const LoginInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
//# sourceMappingURL=users.schema.d.ts.map