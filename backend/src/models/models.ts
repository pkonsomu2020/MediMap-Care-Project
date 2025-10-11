// ---- User ----
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  password?: string | null;
}

// ---- Clinic ----
export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string[] | null;
  consultationFee: number | null;
  contact: string | null;
  rating: number | null;
}

// ---- Appointment ----
export interface Appointment {
  id: string;
  userId: string;
  clinicId: string;
  date: string;   // or Date if you're parsing
  time: string;   // optional if stored separately
  status: 'scheduled' | 'completed' | 'cancelled';
}

// ---- Review ----
export interface Review {
  id: string;
  userId: string;
  clinicId: string;
  rating: number;
  comment: string | null;
}
