"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = findByEmail;
exports.createUser = createUser;
exports.getById = getById;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
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
async function getUserProfile(userId) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('users_with_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function updateUserProfile(userId, profileData) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { first_name, last_name, phone, date_of_birth, gender, address, blood_type, allergies, medical_conditions, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, } = profileData;
    const profileToUpsert = {
        user_id: userId,
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        address,
        blood_type,
        allergies: Array.isArray(allergies) ? allergies : (allergies || '').split(',').map((s) => s.trim()),
        medical_conditions: Array.isArray(medical_conditions) ? medical_conditions : (medical_conditions || '').split(',').map((s) => s.trim()),
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone,
    };
    const { data, error } = await supabase_1.serviceClient
        .from('user_profiles')
        .upsert(profileToUpsert, { onConflict: 'user_id' })
        .select()
        .single();
    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    return data;
}
//# sourceMappingURL=users.repo.js.map