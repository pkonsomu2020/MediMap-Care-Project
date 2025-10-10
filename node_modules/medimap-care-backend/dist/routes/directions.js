"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const mapsClient = new google_maps_services_js_1.Client({});
router.post('/', async (req, res, next) => {
    const { origin, destination } = req.body;
    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
        return res.status(400).json({ message: 'Origin and destination with lat/lng are required.' });
    }
    if (!env_1.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ message: 'Google Maps API key is not configured.' });
    }
    const params = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        mode: google_maps_services_js_1.TravelMode.driving,
        key: env_1.env.GOOGLE_MAPS_API_KEY,
    };
    try {
        const response = await mapsClient.directions({ params });
        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const leg = route?.legs?.[0];
            const polyline = route?.overview_polyline?.points;
            if (!leg || !polyline) {
                return res.status(404).json({ message: 'Invalid route data received.' });
            }
            res.json({
                distance: leg.distance?.text || 'Unknown',
                duration: leg.duration?.text || 'Unknown',
                polyline,
            });
        }
        else {
            res.status(404).json({ message: 'No routes found.' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=directions.js.map