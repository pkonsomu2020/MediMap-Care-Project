import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import { logApiResult } from '@/lib/logging';

export type LatLng = { lat: number; lng: number };

export interface GeocodeState {
  loading: boolean;
  error: string | null;
  result: {
    lat: number;
    lng: number;
    formattedAddress?: string;
    placeId?: string;
  } | null;
}

export function useGeocode() {
  const [forward, setForward] = useState<GeocodeState>({
    loading: false,
    error: null,
    result: null,
  });
  const [reverse, setReverse] = useState<GeocodeState>({
    loading: false,
    error: null,
    result: null,
  });

  const geocodeAddress = useCallback(async (address: string) => {
    setForward((s) => ({ ...s, loading: true, error: null }));
    try {
      // const res1 = (await api.getSupabasePlace({query: address, match_count: 10}))
      // console.log(res1)
      const res = await api.geocodeAddress(address);
      setForward({ loading: false, error: null, result: res });
      logApiResult('places.geocode', {
        request: { mode: 'forward', address },
        responseSummary: { formattedAddress: res.formattedAddress, lat: res.lat, lng: res.lng, placeId: res.placeId },
      });
      return res;
    } catch (e: any) {
      const msg = e?.message || 'Failed to geocode address';
      setForward({ loading: false, error: msg, result: null });
      logApiResult('places.geocode', { request: { mode: 'forward', address }, responseSummary: { ok: false, error: msg } }, { color: '#ef4444' });
      throw e;
    }
  }, []);

  const reverseGeocode = useCallback(async (coords: LatLng) => {
    setReverse((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.geocodeReverse(coords.lat, coords.lng);
      setReverse({ loading: false, error: null, result: res });
      logApiResult('places.geocode', {
        request: { mode: 'reverse', coords },
        responseSummary: { formattedAddress: res.formattedAddress, lat: res.lat, lng: res.lng, placeId: res.placeId },
      });
      return res;
    } catch (e: any) {
      const msg = e?.message || 'Failed to reverse geocode';
      setReverse({ loading: false, error: msg, result: null });
      logApiResult('places.geocode', { request: { mode: 'reverse', coords }, responseSummary: { ok: false, error: msg } }, { color: '#ef4444' });
      throw e;
    }
  }, []);

  return {
    forward,
    reverse,
    geocodeAddress,
    reverseGeocode,
  };
}