// types.ts
export type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  rating?: number;
  contact?: string;
  consultation_fee?: number;
  services?: string;
  latitude?: number;
  longitude?: number;
};

export type LocationRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};