"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClinics = listClinics;
exports.getClinicById = getClinicById;
exports.createClinic = createClinic;
exports.upsertClinics = upsertClinics;
const supabase_1 = require("../config/supabase");
async function listClinics(where = {}) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    let query = supabase_1.serviceClient
        .from('clinics')
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating');
    if (where.q) {
        query = query.ilike('name', `%${where.q}%`);
    }
    if (typeof where.min_rating === 'number') {
        query = query.gte('rating', where.min_rating);
    }
    const { data, error } = await query;
    if (error)
        throw error;
    return data || [];
}
async function getClinicById(id) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('clinics')
        .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
        .eq('clinic_id', id)
        .maybeSingle();
    if (error)
        throw error;
    return data || null;
}
async function createClinic(payload) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('clinics')
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
async function upsertClinics(clinics) {
    if (!supabase_1.serviceClient)
        throw new Error('Supabase not configured');
    const { data, error } = await supabase_1.serviceClient
        .from('clinics')
        .upsert(clinics.map((clinic) => ({
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        rating: clinic.rating,
        google_place_id: clinic.google_place_id,
    })), { onConflict: 'google_place_id' })
        .select();
    if (error)
        throw error;
    return data;
}
//# sourceMappingURL=clinics.repo.js.map