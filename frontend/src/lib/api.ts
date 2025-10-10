export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface User {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Clinic {
  clinic_id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  services?: string;
  consultation_fee?: number;
  contact?: string;
  rating: number;
}

interface Appointment {
  appointment_id: number;
  user_id: number;
  clinic_id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface Review {
  review_id: number;
  user_id: number;
  clinic_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    // ignore localStorage errors
  }
  return null;
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
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export const api = {
  // Auth
  login(payload: { email: string; password: string }) {
    return request<{ token: string; user: User }>(`/users/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  googleLogin(payload: { id_token: string }) {
    return request<{ token: string; user: any }>(`/users/google-login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: { name: string; email: string; phone?: string; password: string; role?: 'user' | 'clinic' | 'admin' }) {
    return request<{ token: string; user: User }>(`/users/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  googleLogin(payload: { id_token: string }) {
    return request<{ token: string; user: User }>(`/users/google-login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getCurrentUser() {
    return request<User>(`/users/me`);
  },

  // Clinics
  listClinics(params?: { q?: string; min_rating?: number }) {
    const usp = new URLSearchParams();
    if (params?.q) usp.set('q', params.q);
    if (typeof params?.min_rating === 'number') usp.set('min_rating', String(params.min_rating));
    const qs = usp.toString();
    return request<Clinic[]>(`/clinics${qs ? `?${qs}` : ''}`);
  },
  getClinic(id: number) {
    return request<Clinic>(`/clinics/${id}`);
  },

  // Appointments
  listAppointments() {
    return request<Appointment[]>(`/appointments`);
  },
  createAppointment(payload: { clinic_id: number; date: string; time: string; status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) {
    return request<Appointment>(`/appointments`, { method: 'POST', body: JSON.stringify(payload) });
  },
  updateAppointment(id: number, changes: Partial<{ status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; date: string; time: string }>) {
    return request<Appointment>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
  },
  deleteAppointment(id: number) {
    return request<{ message: string }>(`/appointments/${id}`, { method: 'DELETE' });
  },

  // Reviews
  listReviewsByClinic(clinicId: number) {
    return request<Review[]>(`/reviews/clinic/${clinicId}`);
  },
  createReview(payload: { clinic_id: number; rating: number; comment?: string }) {
    return request<Review>(`/reviews`, { method: 'POST', body: JSON.stringify(payload) });
  },
};

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  } catch {
    // ignore localStorage errors
  }
}
