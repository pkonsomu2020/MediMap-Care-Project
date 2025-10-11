export declare function findUserByEmail(email: string): Promise<{
    user_id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
    password: any;
} | null>;
export declare function createUserDb(payload: {
    name: string;
    email: string;
    phone?: string | null;
    password: string;
    role?: string;
}): Promise<{
    user_id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
}>;
export declare function listClinicsDb(filters?: {
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
export declare function getClinicDb(id: number): Promise<{
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
export declare function createClinicDb(payload: {
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
export declare function updateClinicDb(id: number, changes: Partial<{
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    services: string | null;
    consultation_fee: number | null;
    contact: string | null;
    rating: number;
}>): Promise<{
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
export declare function deleteClinicDb(id: number): Promise<void>;
export declare function listAppointmentsByUserDb(userId: number): Promise<{
    appointment_id: any;
    user_id: any;
    clinic_id: any;
    date: any;
    time: any;
    status: any;
}[]>;
export declare function getAppointmentDb(id: number): Promise<{
    appointment_id: any;
    user_id: any;
    clinic_id: any;
    date: any;
    time: any;
    status: any;
} | null>;
export declare function createAppointmentDb(payload: {
    user_id: number;
    clinic_id: number;
    date: string;
    time: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
}): Promise<{
    appointment_id: any;
    user_id: any;
    clinic_id: any;
    date: any;
    time: any;
    status: any;
}>;
export declare function updateAppointmentDb(id: number, changes: Partial<{
    status: 'pending' | 'confirmed' | 'cancelled';
    date: string;
    time: string;
}>): Promise<{
    appointment_id: any;
    user_id: any;
    clinic_id: any;
    date: any;
    time: any;
    status: any;
}>;
export declare function deleteAppointmentDb(id: number): Promise<void>;
export declare function listReviewsByClinicDb(clinicId: number): Promise<{
    review_id: any;
    user_id: any;
    clinic_id: any;
    rating: any;
    comment: any;
    created_at: any;
}[]>;
export declare function createReviewDb(payload: {
    user_id: number;
    clinic_id: number;
    rating: number;
    comment?: string | null;
}): Promise<{
    review_id: any;
    user_id: any;
    clinic_id: any;
    rating: any;
    comment: any;
    created_at: any;
}>;
//# sourceMappingURL=data.d.ts.map