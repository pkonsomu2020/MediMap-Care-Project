"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInput = exports.RegisterInput = void 0;
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
//# sourceMappingURL=users.schema.js.map