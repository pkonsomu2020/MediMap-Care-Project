"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryClinicsInput = exports.CreateClinicInput = void 0;
const zod_1 = require("zod");
exports.CreateClinicInput = zod_1.z.object({
    name: zod_1.z.string().min(1),
    address: zod_1.z.string().optional(),
    latitude: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    longitude: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    services: zod_1.z.string().optional(),
    consultation_fee: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    contact: zod_1.z.string().optional(),
});
exports.QueryClinicsInput = zod_1.z.object({
    q: zod_1.z.string().optional(),
    min_rating: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    offset: zod_1.z.string().optional(),
});
//# sourceMappingURL=clinics.schema.js.map