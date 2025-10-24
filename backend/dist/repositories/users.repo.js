"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = findByEmail;
exports.createUser = createUser;
exports.getById = getById;
exports.updateUserDb = updateUserDb;
const supabase_1 = require("../config/supabase");
async function findByEmail(email) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('users')
        .select('user_id, name, email, phone, role, password')
        .eq('email', email)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function createUser(payload) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('users')
        .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? null,
        password: payload.password,
        role: payload.role ?? 'user',
    })
        .select('user_id, name, email, phone, role')
        .single();
    if (error)
        throw error;
    return data;
}
async function getById(userId) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('users')
        .select('user_id, name, email, phone, role')
        .eq('user_id', userId)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function updateUserDb(userId, updates) {
    const { data, error } = await supabase_1.serviceClient
        .from("users")
        .update({
        ...updates,
        profile_updated_at: new Date().toISOString(),
    })
        .eq("user_id", userId)
        .select("user_id, first_name, last_name, email, phone, gender, date_of_birth, address, latitude, longitude, place_id, blood_type, allergies, medications, medical_conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, profile_picture_url, is_completed, role")
        .single();
    if (error)
        throw error;
    return data;
}
//# sourceMappingURL=users.repo.js.map