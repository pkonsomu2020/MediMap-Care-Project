"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googlePlacesService = exports.GooglePlacesService = void 0;
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
class GooglePlacesService {
    constructor() {
        this.baseUrl = 'https://places.googleapis.com/v1/places';
        this.geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        this.directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';
        this.apiKey = env_1.env.GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('  GOOGLE_MAPS_API_KEY not set. Google Places API features will not work.');
        }
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deriveCategory(placeTypes) {
        const types = (placeTypes || []).map((t) => t.toLowerCase());
        if (types.includes('pharmacy') || types.includes('drugstore'))
            return 'pharmacy';
        if (types.includes('doctor') || types.includes('physician') || types.includes('medical_doctor'))
            return 'doctor';
        if (types.includes('hospital'))
            return 'hospital';
        if (types.includes('clinic') || types.includes('health') || types.includes('healthcare') || types.includes('medical'))
            return 'clinic';
        return 'hospital';
    }
    logCall(scope, payload) {
        const timestamp = new Date().toISOString();
        console.log(`[GooglePlacesService] ${scope}`, { timestamp, ...payload });
    }
    async searchNearby(options) {
        const { latitude, longitude, radiusMeters = 5000, types = ['hospital'], maxResultCount = 20, ranking, regionCode = 'KE', languageCode = 'en', } = options;
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.');
        }
        const requestBody = {
            includedTypes: types,
            maxResultCount,
            locationRestriction: {
                circle: {
                    center: { latitude, longitude },
                    radius: radiusMeters,
                },
            },
            regionCode,
            languageCode,
        };
        if (ranking) {
            requestBody.rankPreference = ranking;
        }
        this.logCall('places.searchNearby.request', {
            latitude,
            longitude,
            radiusMeters,
            types,
            maxResultCount,
            ranking,
            regionCode,
            languageCode,
        });
        try {
            const response = await fetch(`${this.baseUrl}:searchNearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types',
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
            }
            const data = (await response.json());
            const queryMeta = {
                latitude,
                longitude,
                radiusMeters,
                types,
                maxResultCount,
                regionCode,
                languageCode,
                ...(ranking ? { ranking } : {}),
            };
            const result = {
                places: data.places ?? [],
                meta: {
                    query: queryMeta,
                },
            };
            this.logCall('places.searchNearby.response', {
                resultCount: result.places.length,
            });
            return result;
        }
        catch (error) {
            console.error('Error fetching nearby clinics:', error);
            throw error;
        }
    }
    async searchNearbyHospitals(latitude, longitude, radiusMeters = 5000, type = 'hospital') {
        const result = await this.searchNearby({
            latitude,
            longitude,
            radiusMeters,
            types: [type],
        });
        return result.places;
    }
    async getPlaceDetails(placeId) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.');
        }
        try {
            const response = await fetch(`${this.baseUrl}/${placeId}`, {
                method: 'GET',
                headers: {
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,businessStatus,types,websiteUri,phoneNumber,openingHours'
                }
            });
            if (!response.ok) {
                throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
            }
            const placeDetails = await response.json();
            this.updateClinicDetails(placeId, placeDetails).catch(err => {
                console.error('Failed to update clinic details:', err);
            });
            return placeDetails;
        }
        catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }
    async saveClinicsToSupabase(places, userLat, userLng) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!places || places.length === 0) {
            return [];
        }
        const clinicsToUpsert = places.map(place => ({
            name: place.displayName.text,
            address: place.formattedAddress,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            rating: place.rating || 0,
            google_place_id: place.id,
            last_updated: new Date().toISOString(),
            is_active: place.businessStatus === 'OPERATIONAL',
            category: this.deriveCategory(place.types),
            source: 'google_places',
            services: place.types?.join(', ') || null
        }));
        const { data, error } = await supabase_1.serviceClient
            .from('clinics')
            .upsert(clinicsToUpsert, { onConflict: 'google_place_id' })
            .select();
        if (error) {
            console.error('Error bulk saving clinics to Supabase:', error);
            throw error;
        }
        const savedClinics = data || [];
        if (userLat !== undefined && userLng !== undefined) {
            const clinicsWithDistance = savedClinics.map(clinic => ({
                ...clinic,
                calculatedDistance: this.calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude)
            }));
            return clinicsWithDistance.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
        }
        return savedClinics;
    }
    async updateClinicDetails(placeId, details) {
        const clinicToUpdate = {
            google_place_id: placeId,
            contact: details.phoneNumber || null,
            details: details,
            last_updated: new Date().toISOString(),
        };
        const { data, error } = await supabase_1.serviceClient
            .from('clinics')
            .upsert(clinicToUpdate, { onConflict: 'google_place_id' })
            .select();
        if (error) {
            console.error('Error updating clinic details in Supabase:', error);
            throw error;
        }
        return data;
    }
    async getCachedClinics(latitude, longitude, radiusKm = 10, typeList) {
        try {
            const latDelta = radiusKm / 111;
            const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
            let query = supabase_1.serviceClient
                .from('clinics')
                .select('*')
                .gte('latitude', latitude - latDelta)
                .lte('latitude', latitude + latDelta)
                .gte('longitude', longitude - lngDelta)
                .lte('longitude', longitude + lngDelta)
                .eq('is_active', true);
            if (typeList && typeList.length > 0) {
                const allowed = typeList
                    .map((t) => t.toLowerCase())
                    .filter((t) => ['hospital', 'doctor', 'pharmacy', 'clinic'].includes(t));
                if (allowed.length > 0) {
                    query = query.in('category', allowed);
                }
            }
            const { data, error } = await query.limit(50);
            if (error)
                throw error;
            const clinics = data || [];
            const clinicsWithDistance = clinics.map(clinic => ({
                ...clinic,
                calculatedDistance: this.calculateDistance(latitude, longitude, clinic.latitude, clinic.longitude)
            }));
            return clinicsWithDistance
                .filter(clinic => clinic.calculatedDistance <= radiusKm)
                .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
                .slice(0, 20);
        }
        catch (error) {
            console.error('Error fetching cached clinics:', error);
            throw error;
        }
    }
    async getDirections(origin, destination) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured.');
        }
        const params = new URLSearchParams({
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            key: this.apiKey,
        });
        this.logCall('directions.request', { origin, destination });
        try {
            const response = await fetch(`${this.directionsUrl}?${params.toString()}`);
            const data = (await response.json());
            if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
                throw new Error('Could not get directions. ' + (data.error_message || data.status));
            }
            const route = data.routes[0];
            if (!route) {
                throw new Error('Could not get directions. Route unavailable.');
            }
            const legs = (route.legs ?? []).map((leg) => ({
                distanceText: leg.distance.text,
                durationText: leg.duration.text,
                startAddress: leg.start_address,
                endAddress: leg.end_address,
                steps: leg.steps?.map((step) => ({
                    htmlInstruction: step.html_instructions,
                    distanceText: step.distance.text,
                    durationText: step.duration.text,
                    polyline: step.polyline?.points ?? '',
                })) ?? [],
            }));
            const normalized = {
                distanceText: legs[0]?.distanceText ?? '',
                durationText: legs[0]?.durationText ?? '',
                polyline: route.overview_polyline?.points ?? '',
                legs,
            };
            this.logCall('directions.response', {
                status: data.status,
                distanceText: normalized.distanceText,
                durationText: normalized.durationText,
                legCount: normalized.legs.length,
            });
            return normalized;
        }
        catch (error) {
            console.error('Error fetching directions:', error);
            throw error;
        }
    }
    async geocodeAddress(address) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured.');
        }
        const params = new URLSearchParams({
            address,
            key: this.apiKey,
        });
        this.logCall('geocode.forward.request', { address });
        try {
            const response = await fetch(`${this.geocodeUrl}?${params.toString()}`);
            const data = (await response.json());
            if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                throw new Error('Could not geocode address. ' + (data.error_message || data.status));
            }
            const firstResult = data.results[0];
            if (!firstResult) {
                throw new Error('Could not geocode address. No results returned.');
            }
            const location = firstResult.geometry.location;
            this.logCall('geocode.forward.response', {
                status: data.status,
                formattedAddress: firstResult.formatted_address,
                placeId: firstResult.place_id,
            });
            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: firstResult.formatted_address ?? undefined,
                placeId: firstResult.place_id ?? undefined,
            };
        }
        catch (error) {
            console.error('Error geocoding address:', error);
            throw error;
        }
    }
    async reverseGeocode(coords) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured.');
        }
        const params = new URLSearchParams({
            latlng: `${coords.lat},${coords.lng}`,
            key: this.apiKey,
        });
        this.logCall('geocode.reverse.request', coords);
        try {
            const response = await fetch(`${this.geocodeUrl}?${params.toString()}`);
            const data = (await response.json());
            if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                throw new Error('Could not reverse geocode coordinates. ' + (data.error_message || data.status));
            }
            const firstResult = data.results[0];
            const location = firstResult.geometry.location;
            this.logCall('geocode.reverse.response', {
                status: data.status,
                formattedAddress: firstResult.formatted_address,
                placeId: firstResult.place_id,
            });
            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: firstResult.formatted_address ?? undefined,
                placeId: firstResult.place_id ?? undefined,
            };
        }
        catch (error) {
            console.error('Error reverse geocoding coordinates:', error);
            throw error;
        }
    }
}
exports.GooglePlacesService = GooglePlacesService;
exports.googlePlacesService = new GooglePlacesService();
//# sourceMappingURL=googlePlaces.js.map