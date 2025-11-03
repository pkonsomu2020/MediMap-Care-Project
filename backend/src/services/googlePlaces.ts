import { serviceClient } from '../config/supabase';
import { env } from '../config/env';


interface GooglePlaceResult {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  businessStatus: string;
  types?: string[];
}

interface NearbySearchResponse {
  places: GooglePlaceResult[];
}

interface NearbySearchOptions {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  types?: string[];
  maxResultCount?: number;
  ranking?: 'DISTANCE' | 'POPULARITY';
  regionCode?: string;
  languageCode?: string;
}

interface NearbySearchResult {
  places: GooglePlaceResult[];
  meta: {
    query: (Omit<NearbySearchOptions, 'latitude' | 'longitude'> & {
      latitude: number;
      longitude: number;
      mixed?: boolean; // ✅ optional flag
    });
  };
}


export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string | undefined;
  placeId?: string | undefined;
}

export interface GeocodeMicroserviceResponse {
  results?: GeocodeResult[]; // your microservice may return an array of results
  result?: GeocodeResult;    // or a single result
  status?: string;
  message?: string;
}

type DirectionsLeg = {
  distanceText: string;
  durationText: string;
  startAddress: string;
  endAddress: string;
  steps: {
    htmlInstruction: string;
    distanceText: string;
    durationText: string;
    polyline: string;
  }[];
};

type DirectionsResponse = {
  distanceText: string;
  durationText: string;
  polyline: string;
  legs: DirectionsLeg[];
};

export class GooglePlacesService {
  private apiKey: string;
  private clinicTable: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  private directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';

  constructor() {
    this.apiKey = env.GOOGLE_MAPS_API_KEY || '';
    
    // Fix: Use a default value if env variable is not set
    this.clinicTable = env.SUPABASE_CLINICS || 'clinics'; // Default to 'clinics'
    
    if (!this.apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not set. Google Places API features will not work.');
    }
    
    // Log which table is being used for debugging
    console.log(`[GooglePlacesService] Using table: ${this.clinicTable}`);
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Normalize Google place types into one of our categories
   * Returned set: 'hospital' | 'doctor' | 'pharmacy' | 'clinic'
   */
  private deriveCategory(placeTypes?: string[]): 'hospital' | 'doctor' | 'pharmacy' | 'clinic' {
    const types = (placeTypes || []).map((t) => t.toLowerCase());
    // Strong matches first
    if (types.includes('pharmacy') || types.includes('drugstore')) return 'pharmacy';
    if (types.includes('doctor') || types.includes('physician') || types.includes('medical_doctor')) return 'doctor';
    if (types.includes('hospital')) return 'hospital';
    // Clinics and generic health facilities
    if (types.includes('clinic') || types.includes('health') || types.includes('healthcare') || types.includes('medical')) return 'clinic';
    // Fallback
    return 'hospital';
  }

  /**
   * Log helper to keep sensitive data out of console while aiding debugging
   */
  private logCall(scope: string, payload: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[GooglePlacesService] ${scope}`, { timestamp, ...payload });
  }

  /**
   * Search for nearby clinics using Google Places API.
   */
async searchNearby(
  options: NearbySearchOptions,
  microOnly: boolean = false
): Promise<NearbySearchResult> {
  const {
    latitude,
    longitude,
    radiusMeters = 5000,
    types = ['hospital'],
    maxResultCount = 20,
    ranking,
    regionCode = 'KE',
    languageCode = 'en',
  } = options;

  const microPort = env.MICROSERVICE_PORT;
  const microUrl = microPort ? `http://localhost:${microPort}` : null;

  let microResult: NearbySearchResult | null = null;
  let googleResult: NearbySearchResult | null = null;

  // --- Step 1: Microservice search (always runs first for priority) ---
  if (microUrl) {
    try {
      console.log(`[searchNearby] 🔍 Trying microservice search on ${microUrl}`);
      const resp = await fetch(`${microUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (resp.ok) {
        const json = (await resp.json().catch(() => null)) as Partial<NearbySearchResult> | null;
        if (json && Array.isArray(json.places)) {
          console.log(`✅ Microservice search returned ${json.places.length} results.`);
          microResult = json as NearbySearchResult;
          if (microOnly) {
            console.log('ℹ️ microOnly = true → returning only microservice results.');
            return microResult;
          }
        } else {
          console.warn('⚠️ Microservice returned no results.');
        }
      } else {
        console.warn(`⚠️ Microservice search failed: ${resp.status} ${resp.statusText}`);
      }
    } catch (err) {
      console.error('❌ Microservice search error:', err);
    }
  } else {
    console.warn('⚠️ No microservice port configured, skipping microservice search.');
  }

  // --- Step 2: Google Maps API search ---
  if (!this.apiKey) {
    console.warn('⚠️ No Google API key configured.');
    if (microResult) return microResult;
    throw new Error('Google API key not configured and no microservice results found.');
  }

  const requestBody: Record<string, unknown> = {
    includedTypes: types,
    maxResultCount: 3, // 🔹 Only fetch top 3 results from Google
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as NearbySearchResponse;
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

    // --- Step 3: Combine results ---
    if (microResult && googleResult) {
      const combinedPlaces = [
        ...googleResult.places.slice(0, 3), // first 3 Google results
        ...microResult.places.filter(
          m =>
            !googleResult!.places.some(
              g => g.id === m.id || g.displayName?.text === m.displayName?.text
            )
        ),
      ];

      return {
        places: combinedPlaces,
        meta: { query: { ...microResult.meta.query, mixed: true } },
      };
    }

    // If only Google worked
    if (googleResult) return googleResult;

    // If only microservice worked
    if (microResult) return microResult;

    throw new Error('No results found from either source.');
  } catch (error) {
    console.error('❌ Google Places search error:', error);
    if (microResult) {
      console.log('⚠️ Returning microservice fallback due to Google failure.');
      return microResult;
    }
    throw error;
  }
}



  /**
   * Backwards-compatible helper matching previous API.
   */
  async searchNearbyHospitals(
    latitude: number,
    longitude: number,
    radiusMeters = 5000,
    type = 'hospital'
  ): Promise<GooglePlaceResult[]> {
    const result = await this.searchNearby({
      latitude,
      longitude,
      radiusMeters,
      types: [type],
    });
    return result.places;
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<any> {
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

      // Update clinic details in Supabase asynchronously
      this.updateClinicDetails(placeId, placeDetails).catch(err => {
        console.error('Failed to update clinic details:', err);
      });

      return placeDetails;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  }

  /**
   * Save or update clinic data in Supabase
   * Uses upsert to avoid duplicates and reduce API costs
   */
async saveClinicsToSupabase(
  places: GooglePlaceResult[],
  userLat?: number,
  userLng?: number
): Promise<any[]> {
  console.log(`[saveClinicsToSupabase] Starting with ${places?.length || 0} places`);
  
  if (!places || places.length === 0) {
    return [];
  }

  console.log(places)

  try {
    // Step 1: Get the current maximum ID from the table
    const { data: maxIdData, error: maxIdError } = await serviceClient!
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

    // Step 2: Check which places already exist to avoid duplicates
    const googlePlaceIds = places.map(p => p.id).filter(Boolean);
    const { data: existingClinics, error: existingError } = await serviceClient!
      .from(this.clinicTable)
      .select('google_place_id, place_id')
      .in('google_place_id', googlePlaceIds);

    if (existingError) {
      console.error('❌ Error checking existing clinics:', existingError);
      throw existingError;
    }

    const existingPlaceIds = new Set(existingClinics?.map(c => c.google_place_id) || []);
    console.log(`[saveClinicsToSupabase] Found ${existingPlaceIds.size} existing clinics`);

    // Step 3: Prepare clinics with numeric IDs
    const clinicsToUpsert = places
      .filter(p => {
        const hasId = !!p.id;
        const hasLocation = !!p.location?.latitude && !!p.location?.longitude;
        const isNew = !existingPlaceIds.has(p.id);
        return hasId && hasLocation && isNew;
      })
      .map(place => ({
        place_id: nextId++, // Assign the next available numeric ID
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
      
      // Return existing clinics for this location
      const { data: existingData } = await serviceClient!
        .from(this.clinicTable)
        .select('*')
        .in('google_place_id', googlePlaceIds);
      
      return existingData || [];
    }

    // Step 4: Insert new clinics
    // Print all objects in clinicsToUpsert
    // Try to send each clinic to a local upsert microservice before hitting Supabase.
    // If at least one clinic is successfully upserted via the microservice, skip the DB bulk insert.
    // Determine microservice port; throw if not configured so caller can handle explicitly.
    const microPort = env.MICROSERVICE_PORT;
    if (!microPort) {
      throw new Error('Microservice port not configured. Set MICROSERVICE_PORT or CLINIC_UPSERT_PORT in the environment.');
    }
    const microUrl = `http://localhost:${microPort}`;

    const microSuccesses: any[] = [];
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
      } catch (err) {
      console.warn(`Microservice call error for clinic[${i}]:`, err);
      }
    }

    if (microSuccesses.length > 0) {
      console.log(`[saveClinicsToSupabase] ${microSuccesses.length} clinics upserted via microservice — skipping bulk DB insert`);
      // Return microservice responses to caller. If you need the DB rows instead,
      // modify the microservice to return the inserted rows.
      return microSuccesses;
    }

    console.log('[saveClinicsToSupabase] No clinics upserted via microservice — falling back to direct DB insert');
    const { data, error } = await serviceClient!
      .from(this.clinicTable)
      .insert(clinicsToUpsert)
      .select();

    if (error) {
      console.error('❌ Error inserting clinics:', error);
      throw error;
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} new clinics`);
    return data || [];

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    throw error;
  }
}

  /**
   * Update a single clinic's details in Supabase
   */
  async updateClinicDetails(placeId: string, details: any): Promise<any> {
  const microPort = env.MICROSERVICE_PORT;
  const microUrl = microPort ? `http://localhost:${microPort}/update` : null;

  const clinicToUpdate = {
    google_place_id: placeId,
    contact: details.phoneNumber || null,
    details,
    last_updated: new Date().toISOString(),
  };

  // --- Try microservice update first ---
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

      console.warn(
        `⚠️ Microservice update failed for ${placeId}: ${resp.status} ${resp.statusText}`
      );
    } catch (err) {
      console.error(`❌ Microservice update error for ${placeId}:`, err);
    }
  } else {
    console.warn('⚠️ No microservice port configured. Falling back to direct DB update.');
  }

  // --- Fallback: Direct Supabase update ---
  const { data, error } = await serviceClient!
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


  /**
   * Get cached clinics from Supabase within radius, sorted by distance
   */
  async getCachedClinics(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    typeList?: string[]
  ): Promise<any[]> {
    try {
      // Use PostGIS or simple distance calculation
      // For now, using a simple bounding box approach
      const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
      const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

      let query = serviceClient!
        .from(this.clinicTable)
        .select('*')
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta)
        .eq('is_active', true);

      // Optional filter by normalized category when provided
      if (typeList && typeList.length > 0) {
        // Only allow known categories
        const allowed = typeList
          .map((t) => t.toLowerCase())
          .filter((t) => ['hospital', 'doctor', 'pharmacy', 'clinic'].includes(t));
        if (allowed.length > 0) {
          query = query.in('category', allowed as any);
        }
      }

      const { data, error } = await query.limit(50); // Get more results to sort by distance

      if (error) throw error;
      
      const clinics = data || [];
      
      // Calculate distances and sort by proximity
      const clinicsWithDistance = clinics.map(clinic => ({
        ...clinic,
        calculatedDistance: this.calculateDistance(latitude, longitude, clinic.latitude, clinic.longitude)
      }));

      // Filter by actual radius and sort by distance
      return clinicsWithDistance
        .filter(clinic => clinic.calculatedDistance <= radiusKm)
        .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
        .slice(0, 20); // Limit to 20 results
    } catch (error) {
      console.error('Error fetching cached clinics:', error);
      throw error;
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<DirectionsResponse> {
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
      const data = (await response.json()) as {
        status: string;
        routes?: Array<{
          legs: Array<{
            distance: { text: string };
            duration: { text: string };
            start_address: string;
            end_address: string;
            steps?: Array<{
              html_instructions: string;
              distance: { text: string };
              duration: { text: string };
              polyline?: { points?: string };
            }>;
          }>;
          overview_polyline?: { points?: string };
        }>;
        error_message?: string;
      };

      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        throw new Error('Could not get directions. ' + (data.error_message || data.status));
      }

      const route = data.routes[0];
      if (!route) {
        throw new Error('Could not get directions. Route unavailable.');
      }

      const legs: DirectionsLeg[] = (route.legs ?? []).map((leg) => ({
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps:
          leg.steps?.map((step) => ({
            htmlInstruction: step.html_instructions,
            distanceText: step.distance.text,
            durationText: step.duration.text,
            polyline: step.polyline?.points ?? '',
          })) ?? [],
      }));

      const normalized: DirectionsResponse = {
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
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw error;
    }
  }

async geocodeAddress(address: string, microOnly: boolean = false): Promise<GeocodeResult[]> {
  const microPort = env.MICROSERVICE_PORT;
  const microUrl = microPort ? `http://localhost:${microPort}` : null;

  let microResults: GeocodeResult[] = [];
  let googleResults: GeocodeResult[] = [];

  // --- Step 1: Microservice geocode first ---
  if (microUrl) {
    try {
      console.log(`[geocodeAddress] 🔍 Trying microservice geocode on ${microUrl}`);
      const resp = await fetch(`${microUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: address }),
      });

      if (resp.ok) {
        const json = (await resp.json().catch(() => null)) as GeocodeMicroserviceResponse | null;

        if (json) {
          const resultsArray =
            (Array.isArray(json.results) && json.results) ||
            (json.result ? [json.result] : [json as any]);

          if (resultsArray && resultsArray.length > 0) {
            microResults = resultsArray.map((r: any) => ({
              lat: r.latitude ?? r.geometry?.location?.lat ?? 0,
              lng: r.longitude ?? r.geometry?.location?.lng ?? 0,
              formattedAddress: r.address,
              placeId: r.id || r.place_id,
              name: r.name,
            }));

            console.log(`✅ Microservice returned ${microResults.length} geocode result(s).`);

            if (microOnly && microResults.length > 0) {
              console.log('ℹ️ microOnly = true → returning only microservice results.');
              return microResults!;
            }
          } else {
            console.warn('⚠️ Microservice returned no results.');
          }
        }
      } else {
        console.warn(`⚠️ Microservice geocode failed: ${resp.status} ${resp.statusText}`);
      }
    } catch (err) {
      console.error('❌ Microservice geocode error:', err);
    }
  } else {
    console.warn('⚠️ No microservice port configured, skipping microservice geocode.');
  }

  // --- Step 2: Google Geocoding ---
  if (microOnly) {
    if (microResults.length > 0) return microResults!;
    throw new Error('microOnly is true but microservice returned no results.');
  }

  if (!this.apiKey) {
    console.warn('⚠️ No Google Maps API key configured.');
    if (microResults.length > 0) return microResults!;
    throw new Error('Google API key not configured and no microservice results found.');
  }

  const params = new URLSearchParams({ address, key: this.apiKey });
  this.logCall('geocode.forward.request', { address });

  try {
    const response = await fetch(`${this.geocodeUrl}?${params.toString()}`);
    const data = (await response.json()) as {
      status: string;
      results?: Array<{
        geometry: { location: { lat: number; lng: number } };
        formatted_address?: string;
        place_id?: string;
      }>;
      error_message?: string;
    };

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
    } else {
      console.warn('⚠️ Google geocode returned no valid results.');
    }

    // --- Step 3: Combine results ---
    const combinedResults = [
      ...googleResults,
      ...microResults.filter(
        (m) =>
          !googleResults.some(
            (g) =>
              Math.abs(g.lat - m.lat) < 0.0001 &&
              Math.abs(g.lng - m.lng) < 0.0001 &&
              g.formattedAddress === m.formattedAddress
          )
      ),
    ];

    if (combinedResults.length === 0) {
      throw new Error('No results from Google or microservice.');
    }

    // ✅ Always return a single GeocodeResult (the best one)
    const best = combinedResults[0];
    console.log(
      `[geocodeAddress] ✅ Returning ${combinedResults.length} combined results (best match: ${best!.formattedAddress}).`
    );
    return combinedResults!;
  } catch (error) {
    console.error('❌ Google geocoding error:', error);
    if (microResults.length > 0) {
      console.log('⚠️ Returning microservice fallback due to Google failure.');
      return microResults!;
    }
    throw error;
  }
}

async reverseGeocode(
  coords: { lat: number; lng: number },
  microOnly: boolean = false
): Promise<GeocodeResult> {
  const microPort = env.MICROSERVICE_PORT;
  const microUrl = microPort ? `http://localhost:${microPort}` : null;

  let microResults: GeocodeResult[] = [];
  let googleResults: GeocodeResult[] = [];

  // --- Step 1: Microservice reverse geocode first ---
  if (microUrl) {
    try {
      console.log(`[reverseGeocode] 🔍 Trying microservice reverse geocode on ${microUrl}`);
      const resp = await fetch(`${microUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:  JSON.stringify({ query: coords }),
      });

      if (resp.ok) {
        console.log(resp.json())
        const json = (await resp.json().catch(() => null)) as GeocodeMicroserviceResponse | null;

        if (json) {
          const resultsArray =
            (Array.isArray(json.results) && json.results) ||
            (json.result ? [json.result] : [json as any]);

          if (resultsArray && resultsArray.length > 0) {
            microResults = resultsArray.map((r: any) => ({
              lat: r.latitude ?? r.geometry?.location?.lat ?? 0,
              lng: r.longitude ?? r.geometry?.location?.lng ?? 0,
              formattedAddress: r.address,
              placeId: r.id || r.place_id,
              name: r.name,
            }));

            if (microOnly) {
              console.log('ℹ️ microOnly = true → returning only microservice results.');
              return microResults[0]!; // safe, guarded by .length
            }
          } else {
            console.warn('⚠️ Microservice returned no reverse geocode results.');
          }
        }
      } else {
        console.warn(`⚠️ Microservice reverse geocode failed: ${resp.status} ${resp.statusText}`);
      }
    } catch (err) {
      console.error('❌ Microservice reverse geocode error:', err);
    }
  } else {
    console.warn('⚠️ No microservice port configured, skipping microservice reverse geocode.');
  }

  // --- Step 2: Google Reverse Geocoding ---
  if (microOnly) {
    if (microResults.length > 0) return microResults[0]!;
    throw new Error('microOnly is true but microservice returned no results.');
  }

  if (!this.apiKey) {
    console.warn('⚠️ No Google Maps API key configured.');
    if (microResults.length > 0) return microResults[0]!;
    throw new Error('Google API key not configured and no microservice results found.');
  }

  const params = new URLSearchParams({
    latlng: `${coords.lat},${coords.lng}`,
    key: this.apiKey,
  });

  this.logCall('geocode.reverse.request', coords);

  try {
    const response = await fetch(`${this.geocodeUrl}?${params.toString()}`);
    const data = (await response.json()) as {
      status: string;
      results?: Array<{
        geometry: { location: { lat: number; lng: number } };
        formatted_address?: string;
        place_id?: string;
      }>;
      error_message?: string;
    };

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
    } else {
      console.warn('⚠️ Google reverse geocode returned no valid results.');
    }

    // --- Step 3: Combine results ---
    const combinedResults = [
      ...googleResults,
      ...microResults.filter(
        (m) =>
          !googleResults.some(
            (g) =>
              Math.abs(g.lat - m.lat) < 0.0001 &&
              Math.abs(g.lng - m.lng) < 0.0001 &&
              g.formattedAddress === m.formattedAddress
          )
      ),
    ];

    if (combinedResults.length === 0) {
      throw new Error('No results from Google or microservice.');
    }

    const best = combinedResults[0]; // guaranteed safe now
    console.log(
      `[reverseGeocode] ✅ Returning ${combinedResults.length} combined results (best: ${best!.formattedAddress}).`
    );
    return best!;
  } catch (error) {
    console.error('❌ Google reverse geocoding error:', error);
    if (microResults.length > 0) {
      console.log('⚠️ Returning microservice fallback due to Google failure.');
      return microResults[0]!;
    }
    throw error;
  }
}




}

export const googlePlacesService = new GooglePlacesService();