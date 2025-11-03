"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceClient = void 0;
exports.userClientFromToken = userClientFromToken;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
exports.serviceClient = env_1.env.SUPABASE_URL && env_1.env.SUPABASE_ANON_KEY
    ? (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY)
    : null;
function userClientFromToken(token) {
    if (!env_1.env.SUPABASE_URL || !env_1.env.SUPABASE_ANON_KEY)
        return null;
    const client = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY, {
        global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });
    return client;
}
//# sourceMappingURL=supabase.js.map