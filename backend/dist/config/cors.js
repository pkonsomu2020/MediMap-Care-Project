"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCors = buildCors;
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./env");
function buildCors() {
    const origin = env_1.env.CORS_ORIGIN || '*';
    const allowedOrigins = typeof origin === 'string' ? origin.split(',') : origin;
    const options = {
        origin: allowedOrigins,
        credentials: true,
    };
    return (0, cors_1.default)(options);
}
//# sourceMappingURL=cors.js.map