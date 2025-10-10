import { serviceClient } from '../config/supabase';

if (!serviceClient) {
  // eslint-disable-next-line no-console
  console.warn('Supabase service client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

// USERS
export async function findUserByEmail(email: string) {
  const { data, error } = await serviceClient!.from('users')
    .select('user_id, name, email, phone, role, password')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function findUserById(id: number) {
  const { data, error } = await serviceClient!.from('users')
    .select('user_id, name, email, phone, role')
    .eq('user_id', id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createUserDb(payload: { name: string; email: string; phone?: string | null; password?: string | null; role?: string }) {
  const { data, error } = await serviceClient!.from('users')
    .insert({ name: payload.name, email: payload.email, phone: payload.phone ?? null, password: payload.password ?? null, role: payload.role ?? 'user' })
    .select('user_id, name, email, phone, role')
    .single();
  if (error) throw error;
  return data;
}

// CLINICS
export async function listClinicsDb(filters: { q?: string; min_rating?: number } = {}) {
  let query = serviceClient!.from('clinics')
    .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating');
  if (filters.q) query = query.ilike('name', `%${filters.q}%`);
  if (typeof filters.min_rating === 'number') query = query.gte('rating', filters.min_rating);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getClinicDb(id: number) {
  const { data, error } = await serviceClient!.from('clinics')
    .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
    .eq('clinic_id', id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createClinicDb(payload: { name: string; address?: string | null; latitude: number; longitude: number; services?: string | null; consultation_fee?: number | null; contact?: string | null; }) {
  const { data, error } = await serviceClient!.from('clinics')
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

export async function updateClinicDb(id: number, changes: Partial<{ name: string; address: string | null; latitude: number; longitude: number; services: string | null; consultation_fee: number | null; contact: string | null; rating: number }>) {
  const { data, error } = await serviceClient!.from('clinics')
    .update(changes)
    .eq('clinic_id', id)
    .select('clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClinicDb(id: number) {
  const { error } = await serviceClient!.from('clinics').delete().eq('clinic_id', id);
  if (error) throw error;
}

// APPOINTMENTS
export async function listAppointmentsByUserDb(userId: number) {
  const { data, error } = await serviceClient!.from('appointments')
    .select(`
      appointment_id,
      user_id,
      clinic_id,
      date,
      time,
      status,
      clinics!inner(clinic_id, name, address, contact)
    `)
    .eq('user_id', userId)
    .order('date')
    .order('time');
  if (error) throw error;
  return data || [];
}

export async function getAppointmentDb(id: number) {
  const { data, error } = await serviceClient!.from('appointments')
    .select('appointment_id, user_id, clinic_id, date, time, status')
    .eq('appointment_id', id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createAppointmentDb(payload: { user_id: number; clinic_id: number; date: string; time: string; status?: 'pending'|'confirmed'|'cancelled'|'completed' }) {
  const { data, error } = await serviceClient!.from('appointments')
    .insert(payload)
    .select('appointment_id, user_id, clinic_id, date, time, status')
    .single();
  if (error) throw error;
  return data;
}

export async function updateAppointmentDb(id: number, changes: Partial<{ status: 'pending'|'confirmed'|'cancelled'|'completed'; date: string; time: string }>) {
  const { data, error } = await serviceClient!.from('appointments')
    .update(changes)
    .eq('appointment_id', id)
    .select('appointment_id, user_id, clinic_id, date, time, status')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAppointmentDb(id: number) {
  const { error } = await serviceClient!.from('appointments').delete().eq('appointment_id', id);
  if (error) throw error;
}

// REVIEWS
export async function listReviewsByClinicDb(clinicId: number) {
  const { data, error } = await serviceClient!.from('reviews')
    .select('review_id, user_id, clinic_id, rating, comment, created_at')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createReviewDb(payload: { user_id: number; clinic_id: number; rating: number; comment?: string | null }) {
  const { data, error } = await serviceClient!.from('reviews')
    .insert({ ...payload, comment: payload.comment ?? null })
    .select('review_id, user_id, clinic_id, rating, comment, created_at')
    .single();
  if (error) throw error;
  return data;
}
