import Appointment from '../models/appointment';
export declare function toAppointmentDTO(a: Appointment): {
    appointment_id: number;
    user_id: number;
    clinic_id: number;
    date: string;
    time: string;
    status: "pending" | "confirmed" | "cancelled";
};
//# sourceMappingURL=appointment.dto.d.ts.map