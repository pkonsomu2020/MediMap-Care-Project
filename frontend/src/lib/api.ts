export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error || message;
    } catch {}
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export const api = {
  // Auth
  login(payload: { email: string; password: string }) {
    return request<{ token: string; user: any }>(`/users/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: { name: string; email: string; phone?: string; password: string; role?: 'user' | 'clinic' | 'admin' }) {
    return request<{ token: string; user: any }>(`/users/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getCurrentUser() {
    return request<any>(`/users/me`);
  },

  // Clinics
  listClinics(params?: { q?: string; min_rating?: number }) {
    const usp = new URLSearchParams();
    if (params?.q) usp.set('q', params.q);
    if (typeof params?.min_rating === 'number') usp.set('min_rating', String(params.min_rating));
    const qs = usp.toString();
    return request<any[]>(`/clinics${qs ? `?${qs}` : ''}`);
  },
  getClinic(id: number) {
    return request<any>(`/clinics/${id}`);
  },

  // Appointments
  listAppointments() {
    return request<any[]>(`/appointments`);
  },
  createAppointment(payload: { clinic_id: number; date: string; time: string; status?: 'pending' | 'confirmed' | 'cancelled' }) {
    return request<any>(`/appointments`, { method: 'POST', body: JSON.stringify(payload) });
  },
  updateAppointment(id: number, changes: Partial<{ status: 'pending' | 'confirmed' | 'cancelled'; date: string; time: string }>) {
    return request<any>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
  },
  deleteAppointment(id: number) {
    return request<{ message: string }>(`/appointments/${id}`, { method: 'DELETE' });
  },

  // Reviews
  listReviewsByClinic(clinicId: number) {
    return request<any[]>(`/reviews/clinic/${clinicId}`);
  },
  createReview(payload: { clinic_id: number; rating: number; comment?: string }) {
    return request<any>(`/reviews`, { method: 'POST', body: JSON.stringify(payload) });
  },
};

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  } catch {}
}
