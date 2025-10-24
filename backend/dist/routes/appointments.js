"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../lib/data");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const appointments = await (0, data_1.listAppointmentsByUserDb)(userId);
        return res.json(appointments);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: 'id is required' });
        const appointment = await (0, data_1.getAppointmentDb)(parseInt(id));
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        if (appointment.user_id !== req.auth.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        return res.json(appointment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const { place_id, clinic_id, date, time, status } = req.body;
    if ((!place_id && !clinic_id) || !date || !time) {
        return res.status(400).json({ error: 'Either place_id or clinic_id, date and time are required' });
    }
    try {
        let clinicId;
        if (place_id) {
            const clinic = await (0, data_1.getClinicByGooglePlaceId)(place_id);
            if (!clinic)
                return res.status(400).json({ error: 'Clinic not found. Please search for clinics again.' });
            clinicId = clinic.clinic_id;
        }
        else {
            const clinic = await (0, data_1.getClinicDb)(Number(clinic_id));
            if (!clinic)
                return res.status(400).json({ error: 'Invalid clinic_id' });
            clinicId = clinic.clinic_id;
        }
        const appointment = await (0, data_1.createAppointmentDb)({ user_id: req.auth.userId, clinic_id: clinicId, date, time, status });
        return res.status(201).json(appointment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: 'id is required' });
        const appointmentId = parseInt(id);
        const existing = await (0, data_1.getAppointmentDb)(appointmentId);
        if (!existing)
            return res.status(404).json({ error: 'Appointment not found' });
        if (existing.user_id !== req.auth.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const allowed = {};
        if (req.body.status) {
            console.log('Updating status to:', req.body.status);
            allowed.status = req.body.status;
        }
        if (req.body.date)
            allowed.date = req.body.date;
        if (req.body.time)
            allowed.time = req.body.time;
        console.log('Updating appointment', appointmentId, 'with changes:', allowed);
        const updated = await (0, data_1.updateAppointmentDb)(appointmentId, allowed);
        console.log('Update result:', updated);
        return res.json(updated);
    }
    catch (error) {
        console.error('Error updating appointment:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: 'id is required' });
        const appointmentId = parseInt(id);
        const existing = await (0, data_1.getAppointmentDb)(appointmentId);
        if (!existing)
            return res.status(404).json({ error: 'Appointment not found' });
        if (existing.user_id !== req.auth.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await (0, data_1.deleteAppointmentDb)(appointmentId);
        return res.json({ message: 'Appointment deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=appointments.js.map