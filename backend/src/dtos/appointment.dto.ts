import Appointment from '../models/appointment';

export function toAppointmentDTO(a: Appointment) {
  return {
    appointment_id: a.id,
    user_id: a.userId,
    clinic_id: a.clinicId,
    date: a.date,
    time: a.time,
    status: a.status,
  };
}


