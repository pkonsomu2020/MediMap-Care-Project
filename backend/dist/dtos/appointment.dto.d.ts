<<<<<<< HEAD
import { Appointment } from '../models/models';
export declare function toAppointmentDTO(a: Appointment): {
    appointment_id: string;
    user_id: string;
    clinic_id: string;
    date: string;
    time: string;
    status: "cancelled" | "completed" | "scheduled";
=======
import Appointment from '../models/appointment';
export declare function toAppointmentDTO(a: Appointment): {
    appointment_id: number;
    user_id: number;
    clinic_id: number;
    date: string;
    time: string;
    status: "pending" | "confirmed" | "cancelled";
>>>>>>> vector_search
};
//# sourceMappingURL=appointment.dto.d.ts.map