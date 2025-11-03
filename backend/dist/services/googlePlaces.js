"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googlePlacesService = exports.GooglePlacesService = void 0;
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
class GooglePlacesService {
    constructor() {
        this.baseUrl = 'https://places.googleapis.com/v1/places';
<<<<<<< HEAD
        this.geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        this.directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';
        this.apiKey = env_1.env.GOOGLE_MAPS_API_KEY || '';
        this.clinicTable = env_1.env.SUPABASE_CLINICS || 'clinics';
        if (!this.apiKey) {
            console.warn('GOOGLE_MAPS_API_KEY not set. Google Places API features will not work.');
        }
        console.log(`[GooglePlacesService] Using table: ${this.clinicTable}`);
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
    async searchNearby(options, microOnly = false) {
        const { latitude, longitude, radiusMeters = 5000, types = ['hospital'], maxResultCount = 20, ranking, regionCode = 'KE', languageCode = 'en', } = options;
        const microPort = env_1.env.MICROSERVICE_PORT;
        const microUrl = microPort ? `http://localhost:${microPort}` : null;
        let microResult = null;
        let googleResult = null;
        if (microUrl) {
            try {
                console.log(`[searchNearby] 🔍 Trying microservice search on ${microUrl}`);
                const resp = await fetch(`${microUrl}/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(options),
                });
                if (resp.ok) {
                    const json = (await resp.json().catch(() => null));
                    if (json && Array.isArray(json.places)) {
                        console.log(`✅ Microservice search returned ${json.places.length} results.`);
                        microResult = json;
                        if (microOnly) {
                            console.log('ℹ️ microOnly = true → returning only microservice results.');
                            return microResult;
                        }
                    }
                    else {
                        console.warn('⚠️ Microservice returned no results.');
                    }
                }
                else {
                    console.warn(`⚠️ Microservice search failed: ${resp.status} ${resp.statusText}`);
                }
            }
            catch (err) {
                console.error('❌ Microservice search error:', err);
            }
        }
        else {
            console.warn('⚠️ No microservice port configured, skipping microservice search.');
        }
        if (!this.apiKey) {
            console.warn('⚠️ No Google API key configured.');
            if (microResult)
                return microResult;
            throw new Error('Google API key not configured and no microservice results found.');
        }
        const requestBody = {
            includedTypes: types,
            maxResultCount: 3,
            locationRestriction: {
                circle: {
                    center: { latitude, longitude },
                    radius: radiusMeters,
                },
            },
            regionCode,
            languageCode,
            ...(ranking ? { rankPreference: ranking } : {}),
        };
        this.logCall('places.searchNearby.request', {
            latitude,
            longitude,
            radiusMeters,
            types,
            maxResultCount,
            ranking,
            regionCode,
            languageCode,
            microOnly,
        });
        try {
            const response = await fetch(`${this.baseUrl}:searchNearby`, {
=======
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
>>>>>>> vector_search
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
<<<<<<< HEAD
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types',
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
            }
            const data = (await response.json());
            googleResult = {
                places: data.places ?? [],
                meta: {
                    query: {
                        latitude,
                        longitude,
                        radiusMeters,
                        types,
                        maxResultCount: 3,
                        regionCode,
                        languageCode,
                        ...(ranking ? { ranking } : {}),
                    },
                },
            };
            this.logCall('places.searchNearby.response', {
                googleCount: googleResult.places.length,
                microCount: microResult?.places?.length || 0,
            });
            if (microResult && googleResult) {
                const combinedPlaces = [
                    ...googleResult.places.slice(0, 3),
                    ...microResult.places.filter(m => !googleResult.places.some(g => g.id === m.id || g.displayName?.text === m.displayName?.text)),
                ];
                return {
                    places: combinedPlaces,
                    meta: { query: { ...microResult.meta.query, mixed: true } },
                };
            }
            if (googleResult)
                return googleResult;
            if (microResult)
                return microResult;
            throw new Error('No results found from either source.');
        }
        catch (error) {
            console.error('❌ Google Places search error:', error);
            if (microResult) {
                console.log('⚠️ Returning microservice fallback due to Google failure.');
                return microResult;
            }
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
=======
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
>>>>>>> vector_search
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
<<<<<<< HEAD
    async saveClinicsToSupabase(places, userLat, userLng) {
        console.log(`[saveClinicsToSupabase] Starting with ${places?.length || 0} places`);
        if (!places || places.length === 0) {
            return [];
        }
        console.log(places);
        try {
            const { data: maxIdData, error: maxIdError } = await supabase_1.serviceClient
                .from(this.clinicTable)
                .select('place_id')
                .order('place_id', { ascending: false })
                .limit(1);
            if (maxIdError) {
                console.error('❌ Error getting max ID:', maxIdError);
                throw maxIdError;
            }
            let nextId = 1;
            if (maxIdData && maxIdData[0]) {
                nextId = maxIdData[0].place_id + 1;
            }
            console.log(`[saveClinicsToSupabase] Next available ID: ${nextId}`);
            const googlePlaceIds = places.map(p => p.id).filter(Boolean);
            const { data: existingClinics, error: existingError } = await supabase_1.serviceClient
                .from(this.clinicTable)
                .select('google_place_id, place_id')
                .in('google_place_id', googlePlaceIds);
            if (existingError) {
                console.error('❌ Error checking existing clinics:', existingError);
                throw existingError;
            }
            const existingPlaceIds = new Set(existingClinics?.map(c => c.google_place_id) || []);
            console.log(`[saveClinicsToSupabase] Found ${existingPlaceIds.size} existing clinics`);
            const clinicsToUpsert = places
                .filter(p => {
                const hasId = !!p.id;
                const hasLocation = !!p.location?.latitude && !!p.location?.longitude;
                const isNew = !existingPlaceIds.has(p.id);
                return hasId && hasLocation && isNew;
            })
                .map(place => ({
                place_id: nextId++,
                name: place.displayName?.text || 'Unknown',
                address: place.formattedAddress || 'Unknown',
                latitude: place.location?.latitude ?? 0,
                longitude: place.location?.longitude ?? 0,
                rating: place.rating || 0,
                google_place_id: place.id,
                last_updated: new Date().toISOString(),
                is_active: place.businessStatus === 'OPERATIONAL',
                category: this.deriveCategory(place.types),
                source: 'Google Maps',
                services: place.types?.join(', ') || null
            }));
            console.log(`[saveClinicsToSupabase] Prepared ${clinicsToUpsert.length} new clinics`);
            if (clinicsToUpsert.length === 0) {
                console.log('[saveClinicsToSupabase] No new clinics to insert');
                const { data: existingData } = await supabase_1.serviceClient
                    .from(this.clinicTable)
                    .select('*')
                    .in('google_place_id', googlePlaceIds);
                return existingData || [];
            }
            const microPort = env_1.env.MICROSERVICE_PORT;
            if (!microPort) {
                throw new Error('Microservice port not configured. Set MICROSERVICE_PORT or CLINIC_UPSERT_PORT in the environment.');
            }
            const microUrl = `http://localhost:${microPort}`;
            const microSuccesses = [];
            for (const [i, clinic] of clinicsToUpsert.entries()) {
                console.log(`Attempting microservice upsert for clinic[${i}] google_place_id=${clinic.google_place_id}`);
                try {
                    const resp = await fetch(`${microUrl}/update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(clinic),
                    });
                    if (!resp.ok) {
                        const body = await resp.text().catch(() => '<unreadable body>');
                        console.warn(`Microservice upsert failed for clinic[${i}] status=${resp.status} ${resp.statusText} body=${body}`);
                        continue;
                    }
                    const json = await resp.json().catch(() => null);
                    microSuccesses.push(json ?? { place: clinic, note: 'ok-no-body' });
                    console.log(`Microservice upsert succeeded for clinic[${i}]`);
                }
                catch (err) {
                    console.warn(`Microservice call error for clinic[${i}]:`, err);
                }
            }
            if (microSuccesses.length > 0) {
                console.log(`[saveClinicsToSupabase] ${microSuccesses.length} clinics upserted via microservice — skipping bulk DB insert`);
                return microSuccesses;
            }
            console.log('[saveClinicsToSupabase] No clinics upserted via microservice — falling back to direct DB insert');
            const { data, error } = await supabase_1.serviceClient
                .from(this.clinicTable)
                .insert(clinicsToUpsert)
                .select();
            if (error) {
                console.error('❌ Error inserting clinics:', error);
                throw error;
            }
            console.log(`✅ Successfully inserted ${data?.length || 0} new clinics`);
            return data || [];
        }
        catch (error) {
            console.error('❌ Unexpected error:', error);
            throw error;
        }
    }
    async updateClinicDetails(placeId, details) {
        const microPort = env_1.env.MICROSERVICE_PORT;
        const microUrl = microPort ? `http://localhost:${microPort}/update` : null;
        const clinicToUpdate = {
            google_place_id: placeId,
            contact: details.phoneNumber || null,
            details,
            last_updated: new Date().toISOString(),
        };
        if (microUrl) {
            try {
                console.log(`[updateClinicDetails] 🔁 Attempting microservice update for ${placeId}`);
                const resp = await fetch(microUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clinicToUpdate),
                });
                if (resp.ok) {
                    const json = await resp.json().catch(() => null);
                    console.log(`✅ Microservice updated clinic ${placeId}`);
                    return json ?? clinicToUpdate;
                }
                console.warn(`⚠️ Microservice update failed for ${placeId}: ${resp.status} ${resp.statusText}`);
            }
            catch (err) {
                console.error(`❌ Microservice update error for ${placeId}:`, err);
            }
        }
        else {
            console.warn('⚠️ No microservice port configured. Falling back to direct DB update.');
        }
        const { data, error } = await supabase_1.serviceClient
            .from(this.clinicTable)
            .upsert(clinicToUpdate, { onConflict: 'google_place_id' })
            .select();
        if (error) {
            console.error('❌ Error updating clinic details in Supabase:', error);
            throw error;
        }
        console.log(`✅ Clinic ${placeId} updated directly in database.`);
        return data;
    }
    async getCachedClinics(latitude, longitude, radiusKm = 10, typeList) {
        try {
            const latDelta = radiusKm / 111;
            const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
            let query = supabase_1.serviceClient
                .from(this.clinicTable)
=======
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
>>>>>>> vector_search
                .select('*')
                .gte('latitude', latitude - latDelta)
                .lte('latitude', latitude + latDelta)
                .gte('longitude', longitude - lngDelta)
                .lte('longitude', longitude + lngDelta)
<<<<<<< HEAD
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
=======
                .eq('is_active', true)
                .order('rating', { ascending: false })
                .limit(20);
            if (error)
                throw error;
            return data || [];
>>>>>>> vector_search
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
<<<<<<< HEAD
=======
        const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';
>>>>>>> vector_search
        const params = new URLSearchParams({
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            key: this.apiKey,
        });
<<<<<<< HEAD
        this.logCall('directions.request', { origin, destination });
        try {
            const response = await fetch(`${this.directionsUrl}?${params.toString()}`);
            const data = (await response.json());
=======
        try {
            const response = await fetch(`${DIRECTIONS_API_URL}?${params.toString()}`);
            const data = await response.json();
>>>>>>> vector_search
            if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
                throw new Error('Could not get directions. ' + (data.error_message || data.status));
            }
            const route = data.routes[0];
<<<<<<< HEAD
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
=======
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
>>>>>>> vector_search
        }
        catch (error) {
            console.error('Error fetching directions:', error);
            throw error;
        }
    }
<<<<<<< HEAD
    async geocodeAddress(address, microOnly = false) {
        const microPort = env_1.env.MICROSERVICE_PORT;
        const microUrl = microPort ? `http://localhost:${microPort}` : null;
        let microResults = [];
        let googleResults = [];
        if (microUrl) {
            try {
                console.log(`[geocodeAddress] 🔍 Trying microservice geocode on ${microUrl}`);
                const resp = await fetch(`${microUrl}/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: address }),
                });
                if (resp.ok) {
                    const json = (await resp.json().catch(() => null));
                    if (json) {
                        const resultsArray = (Array.isArray(json.results) && json.results) ||
                            (json.result ? [json.result] : [json]);
                        if (resultsArray && resultsArray.length > 0) {
                            microResults = resultsArray.map((r) => ({
                                lat: r.latitude ?? r.geometry?.location?.lat ?? 0,
                                lng: r.longitude ?? r.geometry?.location?.lng ?? 0,
                                formattedAddress: r.address,
                                placeId: r.id || r.place_id,
                                name: r.name,
                            }));
                            console.log(`✅ Microservice returned ${microResults.length} geocode result(s).`);
                            if (microOnly && microResults.length > 0) {
                                console.log('ℹ️ microOnly = true → returning only microservice results.');
                                return microResults;
                            }
                        }
                        else {
                            console.warn('⚠️ Microservice returned no results.');
                        }
                    }
                }
                else {
                    console.warn(`⚠️ Microservice geocode failed: ${resp.status} ${resp.statusText}`);
                }
            }
            catch (err) {
                console.error('❌ Microservice geocode error:', err);
            }
        }
        else {
            console.warn('⚠️ No microservice port configured, skipping microservice geocode.');
        }
        if (microOnly) {
            if (microResults.length > 0)
                return microResults;
            throw new Error('microOnly is true but microservice returned no results.');
        }
        if (!this.apiKey) {
            console.warn('⚠️ No Google Maps API key configured.');
            if (microResults.length > 0)
                return microResults;
            throw new Error('Google API key not configured and no microservice results found.');
        }
        const params = new URLSearchParams({ address, key: this.apiKey });
        this.logCall('geocode.forward.request', { address });
        try {
            const response = await fetch(`${this.geocodeUrl}?${params.toString()}`);
            const data = (await response.json());
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                googleResults = data.results.slice(0, 3).map((res) => ({
                    lat: res.geometry.location.lat,
                    lng: res.geometry.location.lng,
                    formattedAddress: res.formatted_address,
                    placeId: res.place_id,
                }));
                this.logCall('geocode.forward.response', {
                    source: 'google',
                    count: googleResults.length,
                });
            }
            else {
                console.warn('⚠️ Google geocode returned no valid results.');
            }
            const combinedResults = [
                ...googleResults,
                ...microResults.filter((m) => !googleResults.some((g) => Math.abs(g.lat - m.lat) < 0.0001 &&
                    Math.abs(g.lng - m.lng) < 0.0001 &&
                    g.formattedAddress === m.formattedAddress)),
            ];
            if (combinedResults.length === 0) {
                throw new Error('No results from Google or microservice.');
            }
            const best = combinedResults[0];
            console.log(`[geocodeAddress] ✅ Returning ${combinedResults.length} combined results (best match: ${best.formattedAddress}).`);
            return combinedResults;
        }
        catch (error) {
            console.error('❌ Google geocoding error:', error);
            if (microResults.length > 0) {
                console.log('⚠️ Returning microservice fallback due to Google failure.');
                return microResults;
            }
            throw error;
        }
    }
    async reverseGeocode(coords, microOnly = false) {
        const microPort = env_1.env.MICROSERVICE_PORT;
        const microUrl = microPort ? `http://localhost:${microPort}` : null;
        let microResults = [];
        let googleResults = [];
        if (microUrl) {
            try {
                console.log(`[reverseGeocode] 🔍 Trying microservice reverse geocode on ${microUrl}`);
                const resp = await fetch(`${microUrl}/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: coords }),
                });
                if (resp.ok) {
                    console.log(resp.json());
                    const json = (await resp.json().catch(() => null));
                    if (json) {
                        const resultsArray = (Array.isArray(json.results) && json.results) ||
                            (json.result ? [json.result] : [json]);
                        if (resultsArray && resultsArray.length > 0) {
                            microResults = resultsArray.map((r) => ({
                                lat: r.latitude ?? r.geometry?.location?.lat ?? 0,
                                lng: r.longitude ?? r.geometry?.location?.lng ?? 0,
                                formattedAddress: r.address,
                                placeId: r.id || r.place_id,
                                name: r.name,
                            }));
                            if (microOnly) {
                                console.log('ℹ️ microOnly = true → returning only microservice results.');
                                return microResults[0];
                            }
                        }
                        else {
                            console.warn('⚠️ Microservice returned no reverse geocode results.');
                        }
                    }
                }
                else {
                    console.warn(`⚠️ Microservice reverse geocode failed: ${resp.status} ${resp.statusText}`);
                }
            }
            catch (err) {
                console.error('❌ Microservice reverse geocode error:', err);
            }
        }
        else {
            console.warn('⚠️ No microservice port configured, skipping microservice reverse geocode.');
        }
        if (microOnly) {
            if (microResults.length > 0)
                return microResults[0];
            throw new Error('microOnly is true but microservice returned no results.');
        }
        if (!this.apiKey) {
            console.warn('⚠️ No Google Maps API key configured.');
            if (microResults.length > 0)
                return microResults[0];
            throw new Error('Google API key not configured and no microservice results found.');
        }
        const params = new URLSearchParams({
            latlng: `${coords.lat},${coords.lng}`,
            key: this.apiKey,
        });
        this.logCall('geocode.reverse.request', coords);
        try {
            const response = await fetch(`${this.geocodeUrl}?${params.toString()}`);
            const data = (await response.json());
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                googleResults = data.results.slice(0, 3).map((res) => ({
                    lat: res.geometry.location.lat,
                    lng: res.geometry.location.lng,
                    formattedAddress: res.formatted_address,
                    placeId: res.place_id,
                }));
                this.logCall('geocode.reverse.response', {
                    source: 'google',
                    count: googleResults.length,
                });
            }
            else {
                console.warn('⚠️ Google reverse geocode returned no valid results.');
            }
            const combinedResults = [
                ...googleResults,
                ...microResults.filter((m) => !googleResults.some((g) => Math.abs(g.lat - m.lat) < 0.0001 &&
                    Math.abs(g.lng - m.lng) < 0.0001 &&
                    g.formattedAddress === m.formattedAddress)),
            ];
            if (combinedResults.length === 0) {
                throw new Error('No results from Google or microservice.');
            }
            const best = combinedResults[0];
            console.log(`[reverseGeocode] ✅ Returning ${combinedResults.length} combined results (best: ${best.formattedAddress}).`);
            return best;
        }
        catch (error) {
            console.error('❌ Google reverse geocoding error:', error);
            if (microResults.length > 0) {
                console.log('⚠️ Returning microservice fallback due to Google failure.');
                return microResults[0];
            }
=======
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
>>>>>>> vector_search
            throw error;
        }
    }
}
exports.GooglePlacesService = GooglePlacesService;
exports.googlePlacesService = new GooglePlacesService();
//# sourceMappingURL=googlePlaces.js.map