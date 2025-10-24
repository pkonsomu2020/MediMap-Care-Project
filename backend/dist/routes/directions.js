"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googlePlaces_1 = require("../services/googlePlaces");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { origin, destination } = req.body;
    if (!origin || !origin.lat || !origin.lng || !destination || !destination.lat || !destination.lng) {
        return res.status(400).json({ error: 'Origin and destination with lat/lng are required.' });
    }
    try {
        const directions = await googlePlaces_1.googlePlacesService.getDirections(origin, destination);
        return res.json(directions);
    }
    catch (error) {
        console.error('[DIRECTIONS_ERROR]', error);
        return res.status(500).json({ error: error.message || 'Failed to get directions.' });
    }
});
exports.default = router;
//# sourceMappingURL=directions.js.map