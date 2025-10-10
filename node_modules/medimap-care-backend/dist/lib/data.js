"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.createUserDb = createUserDb;
exports.listClinicsDb = listClinicsDb;
exports.getClinicDb = getClinicDb;
exports.createClinicDb = createClinicDb;
exports.updateClinicDb = updateClinicDb;
exports.deleteClinicDb = deleteClinicDb;
exports.listAppointmentsByUserDb = listAppointmentsByUserDb;
exports.getAppointmentDb = getAppointmentDb;
exports.createAppointmentDb = createAppointmentDb;
exports.updateAppointmentDb = updateAppointmentDb;
exports.deleteAppointmentDb = deleteAppointmentDb;
exports.listReviewsByClinicDb = listReviewsByClinicDb;
exports.createReviewDb = createReviewDb;
const supabase_1 = require("../config/supabase");
if (!supabase_1.serviceClient) {
    console.warn('Supabase service client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}
async function findUserByEmail(email) {
    const { data, error } = await supabase_1.serviceClient.from('users')
        .select('user_id, name, email, phone, role, password')
        .eq('email', email)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function createUserDb(payload) {
    const { data, error } = await supabase_1.serviceClient.from('users')
        .insert({ name: payload.name, email: payload.email, phone: payload.phone ?? null, password: payload.password, role: payload.role ?? 'user' })
        .select('user_id, name, email, phone, role')
        .single();
    if (error)
        throw error;
    return data;
}
async function listClinicsDb(filters = {}) {
    let query = supabase_1.serviceClient.from('clinics')
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating');
    if (filters.q)
        query = query.ilike('name', `%${filters.q}%`);
    if (typeof filters.min_rating === 'number')
        query = query.gte('rating', filters.min_rating);
    const { data, error } = await query;
    if (error)
        throw error;
    return data || [];
}
async function getClinicDb(id) {
    const { data, error } = await supabase_1.serviceClient.from('clinics')
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating');
    if (error)
        throw error;
    return data || null;
}
async function createClinicDb(payload) {
    const { data, error } = await supabase_1.serviceClient.from('clinics')
        .insert({
        name: payload.name,
        address: payload.address ?? null,
        latitude: payload.latitude,
        longitude: payload.longitude,
        services: payload.services ?? null,
        consultation_fee: payload.consultation_fee ?? null,
        contact: payload.contact ?? null,
    })
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
        .single();
    if (error)
        throw error;
    return data;
}
async function updateClinicDb(id, changes) {
    const { data, error } = await supabase_1.serviceClient.from('clinics')
        .update(changes)
        .eq('clinic_id', id)
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
        .single();
    if (error)
        throw error;
    return data;
}
async function deleteClinicDb(id) {
    const { error } = await supabase_1.serviceClient.from('clinics').delete().eq('clinic_id', id);
    if (error)
        throw error;
}
async function listAppointmentsByUserDb(userId) {
    const { data, error } = await supabase_1.serviceClient.from('appointments')
        .select('appointment_id, user_id, clinic_id, date, time, status')
        .eq('user_id', userId)
        .order('date')
        .order('time');
    if (error)
        throw error;
    return data || [];
}
async function getAppointmentDb(id) {
    const { data, error } = await supabase_1.serviceClient.from('appointments')
        .select('appointment_id, user_id, clinic_id, date, time, status')
        .eq('appointment_id', id)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function createAppointmentDb(payload) {
    const { data, error } = await supabase_1.serviceClient.from('appointments')
        .insert(payload)
        .select('appointment_id, user_id, clinic_id, date, time, status')
        .single();
    if (error)
        throw error;
    return data;
}
async function updateAppointmentDb(id, changes) {
    const { data, error } = await supabase_1.serviceClient.from('appointments')
        .update(changes)
        .eq('appointment_id', id)
        .select('appointment_id, user_id, clinic_id, date, time, status')
        .single();
    if (error)
        throw error;
    return data;
}
async function deleteAppointmentDb(id) {
    const { error } = await supabase_1.serviceClient.from('appointments').delete().eq('appointment_id', id);
    if (error)
        throw error;
}
async function listReviewsByClinicDb(clinicId) {
    const { data, error } = await supabase_1.serviceClient.from('reviews')
        .select('review_id, user_id, clinic_id, rating, comment, created_at')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data || [];
}
async function createReviewDb(payload) {
    const { data, error } = await supabase_1.serviceClient.from('reviews')
        .insert({ ...payload, comment: payload.comment ?? null })
        .select('review_id, user_id, clinic_id, rating, comment, created_at')
        .single();
    if (error)
        throw error;
    return data;
}
//# sourceMappingURL=data.js.map