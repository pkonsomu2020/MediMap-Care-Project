"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googlePlacesService = exports.GooglePlacesService = void 0;
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
class GooglePlacesService {
    constructor() {
        this.baseUrl = 'https://places.googleapis.com/v1/places';
        this.apiKey = env_1.env.GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.error('❌ GOOGLE_MAPS_API_KEY not set. Google Places API features will not work.');
        }
        else {
            console.log(' Google Maps API Key loaded successfully');
            console.log(` API Key starts with: ${this.apiKey.substring(0, 10)}...`);
        }
    }
    async searchNearbyHospitals(latitude, longitude, radius = 5000, type = 'hospital') {
        if (!this.apiKey) {
            console.error('❌ Google Maps API key not configured');
            throw new Error('Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.');
        }
        console.log(` Searching nearby hospitals at (${latitude}, ${longitude}) with radius ${radius}m`);
        try {
            const url = `${this.baseUrl}:searchNearby`;
            console.log(` Making request to: ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types'
                },
                body: JSON.stringify({
                    includedTypes: [type],
                    maxResultCount: 20,
                    locationRestriction: {
                        circle: {
                            center: { latitude, longitude },
                            radius
                        }
                    }
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(` Google Places API error: ${response.status} ${response.statusText}`);
                console.error(`Error details: ${errorText}`);
                throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log(` Found ${data.places?.length || 0} places from Google API`);
            return data.places || [];
        }
        catch (error) {
            console.error('Error fetching nearby hospitals:', error);
            throw error;
        }
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
    async textSearch(query) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured.');
        }
        try {
            const response = await fetch(`${this.baseUrl}:searchText`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types'
                },
                body: JSON.stringify({
                    textQuery: query,
                    locationBias: {
                        "circle": {
                            "center": {
                                "latitude": -1.286389,
                                "longitude": 36.817223
                            },
                            "radius": 500000.0
                        }
                    }
                })
            });
            if (!response.ok) {
                throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            const places = data.places || [];
            const savedClinics = await this.saveClinicsToSupabase(places);
            return savedClinics;
        }
        catch (error) {
            console.error('Error in text search:', error);
            throw error;
        }
    }
    async saveClinicsToSupabase(places) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!places || places.length === 0) {
            console.log(' No places to save to Supabase');
            return [];
        }
        console.log(` Saving ${places.length} clinics to Supabase...`);
        const clinicsToUpsert = places.map(place => ({
            name: place.displayName.text,
            address: place.formattedAddress,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            rating: place.rating || 0,
            google_place_id: place.id,
            last_updated: new Date().toISOString(),
            is_active: place.businessStatus === 'OPERATIONAL',
            category: 'hospital',
            source: 'google_places',
            services: place.types?.join(', ') || null
        }));
        const { data, error } = await supabase_1.serviceClient
            .from('clinics')
            .upsert(clinicsToUpsert, { onConflict: 'google_place_id' })
            .select();
        if (error) {
            console.error(' Error bulk saving clinics to Supabase:', error);
            throw error;
        }
        console.log(` Successfully saved ${data?.length || 0} clinics to Supabase`);
        return data || [];
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
    async getCachedClinics(latitude, longitude, radiusKm = 10) {
        try {
            const latDelta = radiusKm / 111;
            const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
            const { data, error } = await supabase_1.serviceClient
                .from('clinics')
                .select('*')
                .gte('latitude', latitude - latDelta)
                .lte('latitude', latitude + latDelta)
                .gte('longitude', longitude - lngDelta)
                .lte('longitude', longitude + lngDelta)
                .eq('is_active', true)
                .order('rating', { ascending: false })
                .limit(20);
            if (error)
                throw error;
            return data || [];
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
        const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';
        const params = new URLSearchParams({
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            key: this.apiKey,
        });
        try {
            const response = await fetch(`${DIRECTIONS_API_URL}?${params.toString()}`);
            const data = await response.json();
            if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
                throw new Error('Could not get directions. ' + (data.error_message || data.status));
            }
            const route = data.routes[0];
            if (!route || !route.legs || route.legs.length === 0) {
                throw new Error('Invalid route data received from Google Maps API');
            }
            const leg = route.legs[0];
            if (!leg || !leg.distance || !leg.duration || !route.overview_polyline) {
                throw new Error('Incomplete route data received from Google Maps API');
            }
            return {
                distance: leg.distance.text,
                duration: leg.duration.text,
                polyline: route.overview_polyline.points,
            };
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
        if (!address || address.trim() === '') {
            throw new Error('Address is required and cannot be empty.');
        }
        const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
        const params = new URLSearchParams({
            address: address.trim(),
            key: this.apiKey,
        });
        try {
            const response = await fetch(`${GEOCODE_API_URL}?${params.toString()}`);
            const data = await response.json();
            if (data.status === 'ZERO_RESULTS') {
                throw new Error(`No results found for address: "${address}". Please try a more specific location.`);
            }
            if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                throw new Error('Could not geocode address. ' + (data.error_message || data.status));
            }
            const result = data.results[0];
            if (!result || !result.geometry || !result.geometry.location) {
                throw new Error('Invalid geocode response from Google Maps API');
            }
            const location = result.geometry.location;
            return { lat: location.lat, lng: location.lng };
        }
        catch (error) {
            console.error('Error geocoding address:', error);
            throw error;
        }
    }
    async reverseGeocode(lat, lng) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured.');
        }
        const REVERSE_GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
        const params = new URLSearchParams({
            latlng: `${lat},${lng}`,
            key: this.apiKey,
        });
        try {
            const response = await fetch(`${REVERSE_GEOCODE_API_URL}?${params.toString()}`);
            const data = await response.json();
            if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                throw new Error('Could not reverse geocode coordinates. ' + (data.error_message || data.status));
            }
            const result = data.results[0];
            if (!result || !result.formatted_address) {
                throw new Error('Invalid reverse geocode response from Google Maps API');
            }
            return result.formatted_address;
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