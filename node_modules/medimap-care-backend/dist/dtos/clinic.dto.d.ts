import Clinic from '../models/clinic';
export declare function toClinicDTO(c: Clinic): {
    clinic_id: number;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    services: string | null;
    consultation_fee: number | null;
    contact: string | null;
    rating: number;
};
//# sourceMappingURL=clinic.dto.d.ts.map