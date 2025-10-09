import { serviceClient } from '../config/supabase';
import { env } from '../config/env';


interface GooglePlaceResult {
  displayName: { text: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  businessStatus: string;
  id: string; // This is the place_id
  types?: string[];
}

interface NearbySearchResponse {
  places: GooglePlaceResult[];
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';

  constructor() {
    this.apiKey = env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('  GOOGLE_MAPS_API_KEY not set. Google Places API features will not work.');
    }
  }

  /**
   * Search for nearby hospitals/clinics using Google Places API
   */
  async searchNearbyHospitals(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    type: string = 'hospital'
  ): Promise<GooglePlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}:searchNearby`, {
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
        throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
      }

      const data: NearbySearchResponse = await response.json();
      return data.places || [];
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      throw error;
    }
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
  async saveClinicsToSupabase(places: GooglePlaceResult[]): Promise<any[]> {
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
      category: 'hospital',
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

    return data || [];
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
   * Get cached clinics from Supabase within radius
   */
  async getCachedClinics(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<any[]> {
    try {
      // Use PostGIS or simple distance calculation
      // For now, using a simple bounding box approach
      const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
      const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

      const { data, error } = await serviceClient!
        .from('clinics')
        .select('*')
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
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
  ): Promise<{ distance: string; duration: string; polyline: string }> {
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
      const leg = route.legs[0];

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured.');
    }

    const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

    const params = new URLSearchParams({
      address,
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${GEOCODE_API_URL}?${params.toString()}`);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error('Could not geocode address. ' + (data.error_message || data.status));
      }

      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }
}

export const googlePlacesService = new GooglePlacesService();