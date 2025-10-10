"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../lib/data");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const appointments = await (0, data_1.listAppointmentsByUserDb)(parseInt(userId));
        return res.json(appointments);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const appointment = await (0, data_1.getAppointmentDb)(parseInt(req.params.id));
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        return res.json(appointment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', async (req, res) => {
    const { user_id, clinic_id, date, time, status } = req.body;
    if (!user_id || !clinic_id || !date || !time) {
        return res.status(400).json({ error: 'user_id, clinic_id, date and time are required' });
    }
    try {
        const clinic = await (0, data_1.getClinicDb)(Number(clinic_id));
        if (!clinic)
            return res.status(400).json({ error: 'Invalid clinic_id' });
        const appointment = await (0, data_1.createAppointmentDb)({ user_id, clinic_id, date, time, status });
        return res.status(201).json(appointment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await (0, data_1.getAppointmentDb)(id);
        if (!existing)
            return res.status(404).json({ error: 'Appointment not found' });
        const allowed = {};
        if (req.body.status)
            allowed.status = req.body.status;
        if (req.body.date)
            allowed.date = req.body.date;
        if (req.body.time)
            allowed.time = req.body.time;
        const updated = await (0, data_1.updateAppointmentDb)(id, allowed);
        return res.json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await (0, data_1.getAppointmentDb)(id);
        if (!existing)
            return res.status(404).json({ error: 'Appointment not found' });
        await (0, data_1.deleteAppointmentDb)(id);
        return res.json({ message: 'Appointment deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=appointments.js.map