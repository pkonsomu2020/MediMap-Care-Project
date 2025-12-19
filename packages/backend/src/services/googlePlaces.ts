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
    query: Omit<NearbySearchOptions, 'latitude' | 'longitude'> & {
      latitude: number;
      longitude: number;
    };
  };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string | undefined;
  placeId?: string | undefined;
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
  private baseUrl = 'https://places.googleapis.com/v1/places';
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  private directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';

  constructor() {
    this.apiKey = env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('  GOOGLE_MAPS_API_KEY not set. Google Places API features will not work.');
    }
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
  async searchNearby(options: NearbySearchOptions): Promise<NearbySearchResult> {
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

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.');
    }

    const requestBody: Record<string, unknown> = {
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
          'X-Goog-FieldMask':
            'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as NearbySearchResponse;

      const queryMeta: NearbySearchResult['meta']['query'] = {
        latitude,
        longitude,
        radiusMeters,
        types,
        maxResultCount,
        regionCode,
        languageCode,
        ...(ranking ? { ranking } : {}),
      };

      const result: NearbySearchResult = {
        places: data.places ?? [],
        meta: {
          query: queryMeta,
        },
      };

      this.logCall('places.searchNearby.response', {
        resultCount: result.places.length,
      });

      return result;
    } catch (error) {
      console.error('Error fetching nearby clinics:', error);
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
  async saveClinicsToSupabase(places: GooglePlaceResult[], userLat?: number, userLng?: number): Promise<any[]> {
    // Artificial delay to investigate potential timing issue
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

    const { data, error } = await serviceClient!
      .from('clinics')
      .upsert(clinicsToUpsert, { onConflict: 'google_place_id' })
      .select();

    if (error) {
      console.error('Error bulk saving clinics to Supabase:', error);
      throw error;
    }

    const savedClinics = data || [];

    // If user location is provided, sort by distance
    if (userLat !== undefined && userLng !== undefined) {
      const clinicsWithDistance = savedClinics.map(clinic => ({
        ...clinic,
        calculatedDistance: this.calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude)
      }));

      return clinicsWithDistance.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }

    return savedClinics;
  }

  /**
   * Update a single clinic's details in Supabase
   */
  async updateClinicDetails(placeId: string, details: any): Promise<any> {
    const clinicToUpdate = {
      google_place_id: placeId,
      contact: details.phoneNumber || null,
      details: details,
      last_updated: new Date().toISOString(),
      // You can add more fields here from the 'details' object if needed
      // For example:
      // website: details.websiteUri || null,
      // opening_hours: details.openingHours || null,
    };

    const { data, error } = await serviceClient!
      .from('clinics')
      .upsert(clinicToUpdate, { onConflict: 'google_place_id' })
      .select();

    if (error) {
      console.error('Error updating clinic details in Supabase:', error);
      throw error;
    }

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
        .from('clinics')
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

  async geocodeAddress(address: string): Promise<GeocodeResult> {
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
      const data = (await response.json()) as {
        status: string;
        results?: Array<{
          geometry: { location: { lat: number; lng: number } };
          formatted_address?: string;
          place_id?: string;
        }>;
        error_message?: string;
      };

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
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  async reverseGeocode(coords: { lat: number; lng: number }): Promise<GeocodeResult> {
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
      const data = (await response.json()) as {
        status: string;
        results?: Array<{
          geometry: { location: { lat: number; lng: number } };
          formatted_address?: string;
          place_id?: string;
        }>;
        error_message?: string;
      };

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error('Could not reverse geocode coordinates. ' + (data.error_message || data.status));
      }

      const firstResult = data.results[0]!;
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
    } catch (error) {
      console.error('Error reverse geocoding coordinates:', error);
      throw error;
    }
  }
}

export const googlePlacesService = new GooglePlacesService();