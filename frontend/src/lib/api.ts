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
const MICRO_SERVICE_URL = import.meta.env.MICROSERVICE_URL || 'http://localhost:8003/api'

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
    return request<{ token: string; user: User }>(`/users/google-login`, {
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
  getClinicByPlaceId(placeId: string) {
    return request<Clinic>(`/clinics/place/${placeId}`);
  },

  // Appointments
  listAppointments() {
    return request<Appointment[]>(`/appointments`);
  },
  createAppointment(payload: { place_id?: string; clinic_id?: number; date: string; time: string; status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) {
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

  // Places (Google Places API integration)
  // Backend expects: lat, lng, radiusKm, radiusMode, types (comma-separated), ranking, maxResults, skipCache
  // Backwards compatible: supports legacy { radius, type } and maps them appropriately.
  searchNearbyPlaces(params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    radius?: number; // legacy
    types?: string[];
    type?: string; // legacy
    radiusMode?: 'preset' | 'drag';
    ranking?: 'DISTANCE' | 'POPULARITY';
    maxResults?: number;
    skipCache?: boolean;
  }) {
    const usp = new URLSearchParams();
    usp.set('lat', String(params.lat));
    usp.set('lng', String(params.lng));
    const radiusKm = params.radiusKm ?? params.radius;
    if (typeof radiusKm === 'number') usp.set('radiusKm', String(radiusKm));
    if (params.radiusMode) usp.set('radiusMode', params.radiusMode);
    const typesCsv = params.types?.join(',') || (params.type ? params.type : '');
    if (typesCsv) usp.set('types', typesCsv);
    if (params.ranking) usp.set('ranking', params.ranking);
    if (typeof params.maxResults === 'number') usp.set('maxResults', String(params.maxResults));
    if (typeof params.skipCache === 'boolean') usp.set('skipCache', String(params.skipCache));
    return request<any>(`/places/nearby?${usp.toString()}`);
  },
  getCachedPlaces(params: { lat: number; lng: number; radius?: number }) {
    const usp = new URLSearchParams();
    usp.set('lat', String(params.lat));
    usp.set('lng', String(params.lng));
    if (params.radius) usp.set('radius', String(params.radius));
    return request<any>(`/places/cached?${usp.toString()}`);
  },
  getPlaceDetails(placeId: string) {
    return request<any>(`/places/details/${placeId}`);
  },

  // Function that uses the embedding microservice for searching
  async getSupabasePlace(params: { query: string; match_count: number }): Promise<any> {
    const token = getAuthToken();
    const res = await fetch(`${MICRO_SERVICE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query: params.query,
        match_count: params.match_count,
      }),
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

    return (await res.json()) as any;
  },
  // Forward geocode: returns { lat, lng, formattedAddress?, placeId? }
  geocodeAddress(address: string) {
    return request<{ mode: 'forward'; result: { lat: number; lng: number; formattedAddress?: string; placeId?: string } }>(
      `/places/geocode`,
      {
        method: 'POST',
        body: JSON.stringify({ address }),
      }
    ).then((r) => r.result);
  },

  // Reverse geocode: returns { lat, lng, formattedAddress?, placeId? }
  geocodeReverse(lat: number, lng: number) {
    return request<{ mode: 'reverse'; result: { lat: number; lng: number; formattedAddress?: string; placeId?: string } }>(
      `/places/geocode`,
      {
        method: 'POST',
        body: JSON.stringify({ lat, lng }),
      }
    ).then((r) => r.result);
  },

  // Normalizes backend fields { distanceText, durationText, polyline, legs? } into legacy shape
  getDirections(payload: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } }) {
    return request<{ distanceText: string; durationText: string; polyline: string; legs?: any[] }>(`/directions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => ({
      distance: r.distanceText,
      duration: r.durationText,
      polyline: r.polyline,
      legs: r.legs,
      distanceText: r.distanceText,
      durationText: r.durationText,
    }));
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
