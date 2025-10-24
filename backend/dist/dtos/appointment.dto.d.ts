import { Appointment } from '../models/models';
export declare function toAppointmentDTO(a: Appointment): {
    appointment_id: string;
    user_id: string;
    clinic_id: string;
    date: string;
    time: string;
    status: "cancelled" | "completed" | "scheduled";
};
//# sourceMappingURL=appointment.dto.d.ts.map