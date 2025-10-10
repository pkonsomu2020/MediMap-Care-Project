import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Access environment variables from Expo
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:8001/api";

/**
 * Get stored authentication token from AsyncStorage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    // Only keep the error log
    console.error("❌ Error getting token:", error);
    return null;
  }
}

/**
 * Core HTTP request helper
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const fullUrl = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let message = `Request failed with ${res.status}`;
      try {
        const body = await res.json();
        // Keep error response body log
        console.error("❌ Error response body:", body);
        message = body?.error || message;
      } catch (e) {
        /* no body to parse */
      }
      throw new Error(message);
    }

    try {
      const data = await res.json();
      return data as T;
    } catch {
      // Return empty object on an empty/non-JSON response body
      return {} as T;
    }
  } catch (error) {
    // Keep request failure log
    console.error("❌ Request failed:", error);
    throw error;
  }
}

/**
 * API client for mobile
 */
export const api = {
  // --- Auth ---
  async login(payload: { email: string; password: string }) {
    return request<{ token: string; user: any }>(`/users/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async register(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: "user" | "clinic" | "admin";
  }) {
    return request<{ token: string; user: any }>(`/users/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getCurrentUser() {
    return request<any>(`/users/me`);
  },

// --- Clinics ---
async listClinics(params?: { q?: string; min_rating?: number }) {
  const usp = new URLSearchParams();
  if (params?.q) usp.set("q", params.q);
  if (typeof params?.min_rating === "number")
    usp.set("min_rating", String(params.min_rating));
  const qs = usp.toString();

  // Fetch all clinics from backend
  const allClinics = await request<any[]>(`/clinics${qs ? `?${qs}` : ""}`);

  // ✅ Limit client-side to first 20 results for performance
  const limitedClinics = allClinics.slice(0, 20);

  return limitedClinics;
},

  // --- Appointments ---
  async listAppointments() {
    return request<any[]>(`/appointments`);
  },

  async createAppointment(payload: {
    clinic_id: number;
    date: string;
    time: string;
    status?: "pending" | "confirmed" | "cancelled";
  }) {
    return request<any>(`/appointments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAppointment(
    id: number,
    changes: Partial<{
      status: "pending" | "confirmed" | "cancelled";
      date: string;
      time: string;
    }>
  ) {
    return request<any>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(changes),
    });
  },

  async deleteAppointment(id: number) {
    return request<{ message: string }>(`/appointments/${id}`, {
      method: "DELETE",
    });
  },

  // --- Reviews ---
  async listReviewsByClinic(clinicId: number) {
    return request<any[]>(`/reviews/clinic/${clinicId}`);
  },

  async createReview(payload: {
    clinic_id: number;
    rating: number;
    comment?: string;
  }) {
    return request<any>(`/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

/**
 * Persist auth token for later requests
 */
export async function setAuthToken(token: string | null) {
  try {
    if (token) {
      await AsyncStorage.setItem("token", token);
    } else {
      await AsyncStorage.removeItem("token");
    }
  } catch (error) {
    // Only keep the error log
    console.error("❌ Error saving token:", error);
  }
}