"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().default('8001'),
    CORS_ORIGIN: zod_1.z.string().optional(),
    SUPABASE_URL: zod_1.z.string().url({
        message: 'SUPABASE_URL is required and must be a valid URL',
    }),
    SUPABASE_ANON_KEY: zod_1.z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1, {
        message: 'SUPABASE_SERVICE_ROLE_KEY is required',
    }),
    JWT_SECRET: zod_1.z.string().optional(),
    JWT_EXPIRES_IN: zod_1.z.string().optional(),
    GOOGLE_MAPS_API_KEY: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.log(process.env);
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}
exports.env = {
    ...parsed.data,
    portNumber: parseInt(parsed.data.PORT || '8001', 10),
};
//# sourceMappingURL=env.js.map