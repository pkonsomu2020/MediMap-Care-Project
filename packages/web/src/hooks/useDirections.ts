import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { logApiResult } from '@/lib/logging';

export type LatLng = { lat: number; lng: number };

export interface UseDirectionsParams {
  origin?: LatLng | null;
  destination?: LatLng | null;
  enabled?: boolean;
}

export interface UseDirectionsResult {
  distanceText: string;
  durationText: string;
  polyline: string;
  legs?: any[];
  path: LatLng[]; // decoded path (if geometry lib available); empty if not decoded
}

/**
 * Safely decode a Google polyline into LatLng[] if geometry library is available.
 */
function tryDecodePolyline(polyline: string): LatLng[] {
  try {
    if (
      typeof window !== 'undefined' &&
      (window as any).google &&
      (window as any).google.maps &&
      (window as any).google.maps.geometry &&
      (window as any).google.maps.geometry.encoding &&
      typeof (window as any).google.maps.geometry.encoding.decodePath === 'function'
    ) {
      const decoded = (window as any).google.maps.geometry.encoding.decodePath(polyline);
      return decoded.map((latLng: any) => ({ lat: latLng.lat(), lng: latLng.lng() }));
    }
  } catch {
    // ignore decoding issues
  }
  return [];
}

/**
 * useDirections()
 * - Fetches directions from backend and decodes polyline (if possible) into a path array.
 */
export function useDirections(params: UseDirectionsParams) {
  const { origin, destination, enabled = true } = params;

  const isReady =
    enabled &&
    !!origin &&
    !!destination &&
    typeof origin.lat === 'number' &&
    typeof origin.lng === 'number' &&
    typeof destination.lat === 'number' &&
    typeof destination.lng === 'number';

  return useQuery<UseDirectionsResult>({
    queryKey: ['directions', origin?.lat, origin?.lng, destination?.lat, destination?.lng],
    enabled: isReady,
    queryFn: async () => {
      const request = { origin: origin as LatLng, destination: destination as LatLng };
      const resp = await api.getDirections(request); // normalized to { distance, duration, polyline, legs? }

      const result: UseDirectionsResult = {
        distanceText: resp.distance || resp.distanceText || '',
        durationText: resp.duration || resp.durationText || '',
        polyline: resp.polyline || '',
        legs: resp.legs,
        path: tryDecodePolyline(resp.polyline || ''),
      };

      logApiResult('directions.route', {
        request,
        responseSummary: {
          distanceText: result.distanceText,
          durationText: result.durationText,
          pathPoints: result.path.length,
        },
      });

      return result;
    },
    staleTime: 0,
  });
}