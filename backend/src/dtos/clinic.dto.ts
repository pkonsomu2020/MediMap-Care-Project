import {Clinic} from '../models/models';

export function toClinicDTO(c: Clinic) {
  return {
    clinic_id: c.id,
    name: c.name,
    address: c.address,
    latitude: c.latitude,
    longitude: c.longitude,
    services: c.services,
    consultation_fee: c.consultationFee,
    contact: c.contact,
    rating: c.rating,
  };
}


