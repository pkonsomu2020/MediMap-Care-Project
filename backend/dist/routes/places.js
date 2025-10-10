"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googlePlaces_1 = require("../services/googlePlaces");
const router = (0, express_1.Router)();
router.get('/nearby', async (req, res) => {
    console.log('📍 [/api/places/nearby] Request received:', req.query);
    try {
        const { lat, lng, radius = '5000', type = 'hospital' } = req.query;
        if (!lat || !lng) {
            console.error(' Missing lat/lng parameters');
            return res.status(400).json({
                error: 'Latitude and longitude are required'
            });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusMeters = parseInt(radius);
        if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
            return res.status(400).json({
                error: 'Invalid latitude, longitude, or radius'
            });
        }
        const cachedClinics = await googlePlaces_1.googlePlacesService.getCachedClinics(latitude, longitude, radiusMeters / 1000);
        if (cachedClinics.length >= 5) {
            console.log(` Returning ${cachedClinics.length} cached clinics`);
            res.setHeader('Cache-Control', 'no-store');
            return res.json({
                clinics: cachedClinics,
                source: 'cache',
                count: cachedClinics.length
            });
        }
        console.log('📡 Cache insufficient, fetching from Google Places API...');
        const places = await googlePlaces_1.googlePlacesService.searchNearbyHospitals(latitude, longitude, radiusMeters, type);
        const savedClinics = await googlePlaces_1.googlePlacesService.saveClinicsToSupabase(places);
        console.log(` Returning ${savedClinics.length} clinics from Google Places`);
        res.setHeader('Cache-Control', 'no-store');
        return res.json({
            clinics: savedClinics,
            source: 'google_places',
            count: savedClinics.length
        });
    }
    catch (error) {
        console.error(' Error fetching nearby places:', error);
        return res.status(500).json({
            error: 'Failed to fetch nearby places',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/details/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;
        if (!placeId) {
            return res.status(400).json({ error: 'Place ID is required' });
        }
        const placeDetails = await googlePlaces_1.googlePlacesService.getPlaceDetails(placeId);
        return res.json(placeDetails);
    }
    catch (error) {
        console.error('Error fetching place details:', error);
        return res.status(500).json({
            error: 'Failed to fetch place details',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/text-search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'A text query is required' });
        }
        const results = await googlePlaces_1.googlePlacesService.textSearch(query);
        return res.json({
            clinics: results,
            source: 'google_places_text_search',
            count: results.length
        });
    }
    catch (error) {
        console.error('Error in text search route:', error);
        return res.status(500).json({
            error: 'Failed to perform text search',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/cached', async (req, res) => {
    try {
        const { lat, lng, radius = '10' } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                error: 'Latitude and longitude are required'
            });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
            return res.status(400).json({
                error: 'Invalid latitude, longitude, or radius'
            });
        }
        const cachedClinics = await googlePlaces_1.googlePlacesService.getCachedClinics(latitude, longitude, radiusKm);
        return res.json({
            clinics: cachedClinics,
            source: 'cache',
            count: cachedClinics.length
        });
    }
    catch (error) {
        console.error('Error fetching cached clinics:', error);
        return res.status(500).json({
            error: 'Failed to fetch cached clinics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/geocode', async (req, res) => {
    const { address } = req.body;
    console.log('📍 [/api/places/geocode] Request for address:', address);
    if (!address) {
        console.error('❌ No address provided');
        return res.status(400).json({ error: 'Address is required' });
    }
    try {
        const location = await googlePlaces_1.googlePlacesService.geocodeAddress(address);
        console.log('✅ Geocoded to:', location);
        return res.json(location);
    }
    catch (error) {
        console.error('❌ [GEOCODE_ERROR]', error);
        return res.status(500).json({ error: error.message || 'Failed to geocode address.' });
    }
});
router.post('/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    try {
        const address = await googlePlaces_1.googlePlacesService.reverseGeocode(lat, lng);
        return res.json({ address });
    }
    catch (error) {
        console.error('[REVERSE_GEOCODE_ERROR]', error);
        return res.status(500).json({ error: error.message || 'Failed to reverse geocode coordinates.' });
    }
});
exports.default = router;
//# sourceMappingURL=places.js.map