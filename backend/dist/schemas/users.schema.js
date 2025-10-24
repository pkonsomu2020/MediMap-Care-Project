"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdateInput = exports.LoginInput = exports.RegisterInput = void 0;
const zod_1 = require("zod");
exports.RegisterInput = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['user', 'clinic', 'admin']).optional(),
});
exports.LoginInput = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.UserUpdateInput = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    emergency_contact: zod_1.z.string().optional(),
    medical_info: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    dob: zod_1.z.string().optional(),
});
//# sourceMappingURL=users.schema.js.map