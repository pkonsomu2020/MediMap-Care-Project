import { serviceClient } from '../config/supabase';

export async function listClinics(where: { q?: string; min_rating?: number } = {}) {
  if (!serviceClient) throw new Error('Supabase not configured');
  let query = serviceClient
    .from('clinics')
    .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating');

  if (where.q) {
    query = query.ilike('name', `%${where.q}%`);
  }
  if (typeof where.min_rating === 'number') {
    query = query.gte('rating', where.min_rating);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getClinicById(id: number) {
  if (!serviceClient) throw new Error('Supabase not configured');
  const { data, error } = await serviceClient
    .from('clinics')
    .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
    .eq('clinic_id', id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createClinic(payload: {
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  services?: string | null;
  consultation_fee?: number | null;
  contact?: string | null;
}) {
  if (!serviceClient) throw new Error('Supabase not configured');
  const { data, error } = await serviceClient
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
  if (error) throw error;
  return data;
}

export async function upsertClinics(
  clinics: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    google_place_id: string;
  }[]
) {
  if (!serviceClient) throw new Error('Supabase not configured');

  const { data, error } = await serviceClient
    .from('clinics')
    .upsert(
      clinics.map((clinic) => ({
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        rating: clinic.rating,
        google_place_id: clinic.google_place_id,
      })),
      { onConflict: 'google_place_id' }
    )
    .select();

  if (error) throw error;
  return data;
}



