"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAppointmentInput = exports.CreateAppointmentInput = void 0;
const zod_1 = require("zod");
exports.CreateAppointmentInput = zod_1.z.object({
    user_id: zod_1.z.number().int(),
    clinic_id: zod_1.z.number().int(),
    date: zod_1.z.string(),
    time: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});
exports.UpdateAppointmentInput = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled']).optional(),
    date: zod_1.z.string().optional(),
    time: zod_1.z.string().optional(),
});
//# sourceMappingURL=appointments.schema.js.map