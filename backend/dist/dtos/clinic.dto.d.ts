<<<<<<< HEAD
import { Clinic } from '../models/models';
export declare function toClinicDTO(c: Clinic): {
    clinic_id: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    services: string[] | null;
    consultation_fee: number | null;
    contact: string | null;
    rating: number | null;
=======
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
>>>>>>> vector_search
};
//# sourceMappingURL=clinic.dto.d.ts.map