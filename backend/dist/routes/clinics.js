"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../lib/data");
const googlePlaces_1 = require("../services/googlePlaces");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { q, min_rating, limit, offset } = req.query;
        const filters = {};
        if (q)
            filters.q = q;
        if (min_rating)
            filters.min_rating = parseFloat(min_rating);
        if (limit)
            filters.limit = parseInt(limit, 10);
        if (offset)
            filters.offset = parseInt(offset, 10);
        const clinics = await (0, data_1.listClinicsDb)(filters);
        return res.json(clinics);
    }
    catch (error) {
        console.error("Error fetching clinics:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const clinic = await (0, data_1.getClinicDb)(id);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        return res.json(clinic);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/place/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;
        if (!placeId) {
            return res.status(400).json({ error: 'placeId is required' });
        }
        const clinic = await (0, data_1.getClinicByGooglePlaceId)(placeId);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        return res.json(clinic);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', async (req, res) => {
    const { name, address, latitude, longitude, services, consultation_fee, contact } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'name, latitude and longitude are required' });
    }
    try {
        const clinic = await (0, data_1.createClinicDb)({
            name,
            address: address || null,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            services: services || null,
            consultation_fee: consultation_fee !== undefined ? parseFloat(consultation_fee) : null,
            contact: contact || null,
        });
        return res.status(201).json(clinic);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/discover', async (req, res) => {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'lat and lng are required' });
    }
    try {
        const types = ['hospital', 'doctor', 'pharmacy'];
        const searchPromises = types.map(type => googlePlaces_1.googlePlacesService.searchNearbyHospitals(parseFloat(lat), parseFloat(lng), 5000, type));
        const results = await Promise.all(searchPromises);
        const allPlaces = results.flat();
        const uniquePlaces = Array.from(new Map(allPlaces.map(place => [place.id, place])).values());
        if (uniquePlaces.length === 0) {
            return res.json([]);
        }
        const savedClinics = await googlePlaces_1.googlePlacesService.saveClinicsToSupabase(uniquePlaces, parseFloat(lat), parseFloat(lng));
        return res.status(200).json(savedClinics);
    }
    catch (error) {
        console.error('[DISCOVER_CLINICS_ERROR]', error);
        return res.status(500).json({ error: error.message || 'Failed to discover clinics.' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await (0, data_1.getClinicDb)(id);
        if (!existing) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        const allowed = {};
        if (req.body.name !== undefined)
            allowed.name = req.body.name;
        if (req.body.address !== undefined)
            allowed.address = req.body.address ?? null;
        if (req.body.latitude !== undefined)
            allowed.latitude = parseFloat(String(req.body.latitude));
        if (req.body.longitude !== undefined)
            allowed.longitude = parseFloat(String(req.body.longitude));
        if (req.body.services !== undefined)
            allowed.services = req.body.services ?? null;
        if (req.body.consultation_fee !== undefined)
            allowed.consultation_fee = req.body.consultation_fee !== null ? parseFloat(String(req.body.consultation_fee)) : null;
        if (req.body.contact !== undefined)
            allowed.contact = req.body.contact ?? null;
        if (req.body.rating !== undefined)
            allowed.rating = parseFloat(String(req.body.rating));
        const updated = await (0, data_1.updateClinicDb)(id, allowed);
        return res.json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await (0, data_1.getClinicDb)(id);
        if (!existing) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        await (0, data_1.deleteClinicDb)(id);
        return res.json({ message: 'Clinic deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=clinics.js.map