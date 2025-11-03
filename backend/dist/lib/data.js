"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
<<<<<<< HEAD
exports.findUserById = findUserById;
exports.createUserDb = createUserDb;
exports.updateUserById = updateUserById;
exports.listClinicsDb = listClinicsDb;
exports.getClinicDb = getClinicDb;
exports.getClinicByGooglePlaceId = getClinicByGooglePlaceId;
=======
exports.createUserDb = createUserDb;
exports.listClinicsDb = listClinicsDb;
exports.getClinicDb = getClinicDb;
>>>>>>> vector_search
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
<<<<<<< HEAD
async function findUserById(id) {
    const { data, error } = await supabase_1.serviceClient.from('users')
        .select('user_id, name, email, phone, role')
        .eq('user_id', id)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function createUserDb(payload) {
    const { data, error } = await supabase_1.serviceClient
        .from("users")
        .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? null,
        password: payload.password ?? null,
        role: payload.role ?? "user",
    })
        .select("user_id, name, email, phone, role")
        .single();
    if (error)
        throw error;
    return {
        ...data,
        password: "hidden",
    };
}
async function updateUserById(userId, updates) {
    const { data: columns } = await supabase_1.serviceClient
        .from('users')
        .select('*')
        .limit(1);
    if (!columns || columns.length === 0) {
        throw new Error('Could not fetch user schema');
    }
    const existingKeys = Object.keys(columns[0]);
    const filteredUpdates = {};
    for (const key of Object.keys(updates)) {
        if (existingKeys.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    }
    console.log('[updateUserById] Filtered updates:', filteredUpdates);
    if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid fields to update');
    }
    const { data, error } = await supabase_1.serviceClient
        .from('users')
        .update(filteredUpdates)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();
    if (error) {
        console.error('[updateUserById] Supabase error:', error);
        throw error;
    }
=======
async function createUserDb(payload) {
    const { data, error } = await supabase_1.serviceClient.from('users')
        .insert({ name: payload.name, email: payload.email, phone: payload.phone ?? null, password: payload.password, role: payload.role ?? 'user' })
        .select('user_id, name, email, phone, role')
        .single();
    if (error)
        throw error;
>>>>>>> vector_search
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
<<<<<<< HEAD
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
        .eq('clinic_id', id)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function getClinicByGooglePlaceId(googlePlaceId) {
    const { data, error } = await supabase_1.serviceClient.from('clinics')
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
        .eq('google_place_id', googlePlaceId)
        .maybeSingle();
=======
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating');
>>>>>>> vector_search
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
<<<<<<< HEAD
        .select(`
      appointment_id,
      user_id,
      clinic_id,
      date,
      time,
      status,
      clinics!inner(clinic_id, name, address, contact)
    `)
=======
        .select('appointment_id, user_id, clinic_id, date, time, status')
>>>>>>> vector_search
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