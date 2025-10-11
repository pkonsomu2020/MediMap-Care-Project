import { serviceClient } from '../config/supabase';

export async function findByEmail(email: string) {
  if (!serviceClient) throw new Error('Supabase not configured');
  const { data, error } = await serviceClient
    .from('users')
    .select('user_id, name, email, phone, role, password')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createUser(payload: { name: string; email: string; phone?: string | null; password: string; role?: string }) {
  if (!serviceClient) throw new Error('Supabase not configured');
  const { data, error } = await serviceClient
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
  if (error) throw error;
  return data;
}

export async function getById(userId: number) {
  if (!serviceClient) throw new Error('Supabase not configured');
  const { data, error } = await serviceClient
    .from('users')
    .select('user_id, name, email, phone, role')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function updateUserDb(
  userId: string | number,
  updates: Record<string, any>
) {
  const { data, error } = await serviceClient!
    .from("users")
    .update({
      ...updates,
      profile_updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select(
      "user_id, first_name, last_name, email, phone, gender, date_of_birth, address, latitude, longitude, place_id, blood_type, allergies, medications, medical_conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, profile_picture_url, is_completed, role"
    )
    .single();

  if (error) throw error;
  return data;
}


