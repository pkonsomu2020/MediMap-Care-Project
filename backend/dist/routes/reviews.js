"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../lib/data");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/clinic/:clinicId', async (req, res) => {
    try {
        const clinicIdParam = req.params.clinicId;
        if (!clinicIdParam) {
            return res.status(400).json({ error: 'clinicId is required' });
        }
        const clinicId = parseInt(clinicIdParam);
        if (isNaN(clinicId)) {
            return res.status(400).json({ error: 'clinicId must be a valid number' });
        }
        const reviews = await (0, data_1.listReviewsByClinicDb)(clinicId);
        return res.json(reviews);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const { clinic_id, rating, comment } = req.body;
    if (!clinic_id || !rating) {
        return res.status(400).json({ error: 'clinic_id and rating are required' });
    }
    const clinicIdNumber = parseInt(clinic_id);
    if (isNaN(clinicIdNumber)) {
        return res.status(400).json({ error: 'clinicId must be a valid number' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }
    try {
        const clinic = await (0, data_1.getClinicDb)(clinicIdNumber);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        const review = await (0, data_1.createReviewDb)({ user_id: req.auth.userId, clinic_id: clinicIdNumber, rating, comment });
        return res.status(201).json(review);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map