"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toClinicDTO = toClinicDTO;
function toClinicDTO(c) {
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
//# sourceMappingURL=clinic.dto.js.map