"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googlePlaces_1 = require("../services/googlePlaces");
const router = (0, express_1.Router)();
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radiusKm = '5', radiusMode = 'preset', types, ranking, maxResults, skipCache, } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        const latitude = Number(lat);
        const longitude = Number(lng);
        const radiusKmNumber = Number(radiusKm);
        const radiusMeters = Math.max(0.1, radiusKmNumber) * 1000;
        const maxResultCount = maxResults ? Number(maxResults) : 20;
        const typeList = types ? types.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
        const shouldBypassCache = skipCache === 'true' || radiusMode === 'drag';
        if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radiusKmNumber)) {
            return res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
        }
        const debug = {
            query: { latitude, longitude, radiusKm: radiusKmNumber, radiusMode, types: typeList, ranking, maxResultCount, skipCache: shouldBypassCache },
            source: 'cache',
        };
        let clinics = [];
        if (!shouldBypassCache) {
            clinics = await googlePlaces_1.googlePlacesService.getCachedClinics(latitude, longitude, radiusKmNumber, typeList);
        }
        if (clinics.length < 5 || shouldBypassCache) {
            const searchRanking = ranking || 'DISTANCE';
            const nearbyResult = await googlePlaces_1.googlePlacesService.searchNearby({
                latitude,
                longitude,
                radiusMeters,
                maxResultCount,
                ...(typeList && typeList.length > 0 ? { types: typeList } : {}),
                ranking: searchRanking,
            });
            clinics = await googlePlaces_1.googlePlacesService.saveClinicsToSupabase(nearbyResult.places, latitude, longitude);
            debug.source = 'google_places';
            debug.placesMeta = nearbyResult.meta;
            debug.placeCount = nearbyResult.places.length;
            debug.ranking = searchRanking;
        }
        else {
            debug.cachedCount = clinics.length;
        }
        res.setHeader('Cache-Control', 'no-store');
        return res.json({
            clinics,
            debug,
        });
    }
    catch (error) {
        console.error('Error fetching nearby places:', error);
        return res.status(500).json({
            error: 'Failed to fetch nearby places',
            details: error instanceof Error ? error.message : 'Unknown error',
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
            details: error instanceof Error ? error.message : 'Unknown error',
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
    const { address, lat, lng } = req.body;
    if (!address && (lat === undefined || lng === undefined)) {
        return res.status(400).json({ error: 'Provide either an address or lat/lng coordinates.' });
    }
    try {
        if (address) {
            const result = await googlePlaces_1.googlePlacesService.geocodeAddress(address);
            return res.json({ mode: 'forward', result });
        }
        const result = await googlePlaces_1.googlePlacesService.reverseGeocode({ lat: Number(lat), lng: Number(lng) });
        return res.json({ mode: 'reverse', result });
    }
    catch (error) {
        console.error('[GEOCODE_ERROR]', error);
        return res.status(500).json({ error: error.message || 'Failed to geocode address.' });
    }
});
exports.default = router;
//# sourceMappingURL=places.js.map