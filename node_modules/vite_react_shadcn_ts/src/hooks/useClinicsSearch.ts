import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { logApiResult } from '@/lib/logging';

export type RadiusMode = 'preset' | 'drag';

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UseClinicsSearchParams {
  userLocation?: UserLocation | null;
  radiusMode?: RadiusMode;
  radiusKm?: number;
  types?: string[];
  ranking?: 'DISTANCE' | 'POPULARITY';
  maxResults?: number;
  skipCache?: boolean;
}

export interface ClinicNormalized {
  id: string | number;
  name: string;
  placeId?: string;
  rating?: number;
  position: { lat: number; lng: number };
  distanceText?: string;
  durationText?: string;
  // Preserve raw for consumers needing extra fields (phone, address, etc.)
  raw: any;
}

export interface UseClinicsSearchResult {
  clinics: any[];
  normalized: ClinicNormalized[];
  debug?: Record<string, unknown>;
}

/**
 * useClinicsSearch()
 * - Queries backend /api/places/nearby with flexible params and normalizes response for map consumption.
 * - Logs grouped console output via logApiResult for easy debugging.
 */
export function useClinicsSearch(params: UseClinicsSearchParams) {
  const {
    userLocation,
    radiusMode = 'preset',
    radiusKm = 5,
    types,
    ranking,
    maxResults,
    skipCache,
  } = params;

  const enabled = Boolean(userLocation?.lat && userLocation?.lng);

  return useQuery<UseClinicsSearchResult>({
    queryKey: [
      'clinicsSearch',
      {
        lat: userLocation?.lat ?? null,
        lng: userLocation?.lng ?? null,
        radiusMode,
        radiusKm,
        types,
        ranking,
        maxResults,
        skipCache,
      },
    ],
    enabled,
    queryFn: async () => {
      if (!userLocation) {
        return { clinics: [], normalized: [] };
      }

      const request = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radiusKm,
        radiusMode,
        ...(types && types.length ? { types } : {}),
        ...(ranking ? { ranking } : {}),
        ...(typeof maxResults === 'number' ? { maxResults } : {}),
        ...(typeof skipCache === 'boolean' ? { skipCache } : {}),
      };

      const response = await api.searchNearbyPlaces(request);

      // Expecting { clinics, debug? }
      const clinics: any[] = Array.isArray(response?.clinics) ? response.clinics : [];

      // Normalize for map
      const normalized: ClinicNormalized[] = clinics.map((c: any, idx: number) => {
        // Try to infer identifiers/fields from Supabase upsert shape
        const id =
          c.google_place_id ||
          c.place_id ||
          c.id ||
          c.clinic_id ||
          `clinic_${idx}`;

        const name = c.name || c.displayName?.text || 'Unnamed clinic';
        const lat = c.latitude ?? c.location?.latitude ?? c.lat ?? c.position?.lat;
        const lng = c.longitude ?? c.location?.longitude ?? c.lng ?? c.position?.lng;

        const position =
          typeof lat === 'number' && typeof lng === 'number'
            ? { lat, lng }
            : { lat: 0, lng: 0 };

        return {
          id,
          name,
          placeId: c.google_place_id || c.placeId || c.id,
          rating: c.rating ?? c.userRatingCount ? Number(c.rating) : undefined,
          position,
          distanceText: c.distanceText,
          durationText: c.durationText,
          raw: c,
        };
      });

      logApiResult('places.nearby', {
        request,
        responseSummary: {
          count: clinics.length,
          normalizedCount: normalized.length,
          radiusKm,
          radiusMode,
          types: (types || []).join(',') || undefined,
        },
        ...(response?.debug ? { debug: response.debug } : {}),
      });

      return {
        clinics,
        normalized,
        debug: response?.debug,
      };
    },
    staleTime: 1000 * 60 * 3, // 3 minutes default per plan
  });
}