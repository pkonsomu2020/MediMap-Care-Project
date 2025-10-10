export declare function listClinics(where?: {
    q?: string;
    min_rating?: number;
}): Promise<{
    clinic_id: any;
    name: any;
    address: any;
    latitude: any;
    longitude: any;
    services: any;
    consultation_fee: any;
    contact: any;
    rating: any;
}[]>;
export declare function getClinicById(id: number): Promise<{
    clinic_id: any;
    name: any;
    address: any;
    latitude: any;
    longitude: any;
    services: any;
    consultation_fee: any;
    contact: any;
    rating: any;
} | null>;
export declare function createClinic(payload: {
    name: string;
    address?: string | null;
    latitude: number;
    longitude: number;
    services?: string | null;
    consultation_fee?: number | null;
    contact?: string | null;
}): Promise<{
    clinic_id: any;
    name: any;
    address: any;
    latitude: any;
    longitude: any;
    services: any;
    consultation_fee: any;
    contact: any;
    rating: any;
}>;
export declare function upsertClinics(clinics: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    google_place_id: string;
}[]): Promise<any[]>;
//# sourceMappingURL=clinics.repo.d.ts.map