import { Router, Request, Response } from 'express';
import { googlePlacesService } from '../services/googlePlaces';

const router = Router();

/**
 * GET /api/places/nearby
 * Discover nearby clinics using Google Places API with optional Supabase cache.
 * Query params:
 *   lat (required) - latitude
 *   lng (required) - longitude
 *   radiusKm (optional) - defaults to 5
 *   radiusMode (optional) - 'preset' | 'drag', determines caching behaviour
 *   types (optional) - comma separated list of place types
 *   ranking (optional) - 'DISTANCE' | 'POPULARITY'
 *   maxResults (optional) - defaults to 20
 */
router.get('/nearby', async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      lat,
      lng,
      radiusKm = '5',
      radiusMode = 'preset',
      types,
      ranking,
      maxResults,
      skipCache,
    } = req.query as {
      lat?: string;
      lng?: string;
      radiusKm?: string;
      radiusMode?: 'preset' | 'drag';
      types?: string;
      ranking?: 'DISTANCE' | 'POPULARITY';
      maxResults?: string;
      skipCache?: string;
    };

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKmNumber = Number(radiusKm);
    const radiusMeters = Math.max(0.1, radiusKmNumber) * 1000;
    const maxResultCount = maxResults ? Number(maxResults) : 20;
    const typeList = types ? types.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
    const shouldBypassCache = skipCache === 'true' || radiusMode === 'drag';

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radiusKmNumber)) {
      return res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
    }

    const debug: Record<string, unknown> = {
      query: { latitude, longitude, radiusKm: radiusKmNumber, radiusMode, types: typeList, ranking, maxResultCount, skipCache: shouldBypassCache },
      source: 'cache',
    };

    let clinics: any[] = [];
    if (!shouldBypassCache) {
      clinics = await googlePlacesService.getCachedClinics(latitude, longitude, radiusKmNumber);
    }

    // If cache is insufficient, fetch from Google Places
    if (clinics.length < 5 || shouldBypassCache) {
      const nearbyResult = await googlePlacesService.searchNearby({
        latitude,
        longitude,
        radiusMeters,
        maxResultCount,
        ...(typeList && typeList.length > 0 ? { types: typeList } : {}),
        ...(ranking ? { ranking } : {}),
      });

      clinics = await googlePlacesService.saveClinicsToSupabase(nearbyResult.places);
      debug.source = 'google_places';
      debug.placesMeta = nearbyResult.meta;
      debug.placeCount = nearbyResult.places.length;
    } else {
      debug.cachedCount = clinics.length;
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      clinics,
      debug,
    });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return res.status(500).json({
      error: 'Failed to fetch nearby places',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/places/details/:placeId
 * Get detailed information about a specific place
 */
router.get('/details/:placeId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { placeId } = req.params;
    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    const placeDetails = await googlePlacesService.getPlaceDetails(placeId);
    return res.json(placeDetails);
  } catch (error) {
    console.error('Error fetching place details:', error);
    return res.status(500).json({
      error: 'Failed to fetch place details',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/places/cached
 * Get cached clinics from Supabase only (no API calls)
 */
router.get('/cached', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { lat, lng, radius = '10' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({ 
        error: 'Invalid latitude, longitude, or radius' 
      });
    }

    const cachedClinics = await googlePlacesService.getCachedClinics(
      latitude, 
      longitude, 
      radiusKm
    );

    return res.json({
      clinics: cachedClinics,
      source: 'cache',
      count: cachedClinics.length
    });

  } catch (error) {
    console.error('Error fetching cached clinics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch cached clinics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/geocode', async (req: Request, res: Response): Promise<Response> => {
  const { address, lat, lng } = req.body as { address?: string; lat?: number; lng?: number };

  if (!address && (lat === undefined || lng === undefined)) {
    return res.status(400).json({ error: 'Provide either an address or lat/lng coordinates.' });
  }

  try {
    if (address) {
      const result = await googlePlacesService.geocodeAddress(address);
      return res.json({ mode: 'forward', result });
    }

    const result = await googlePlacesService.reverseGeocode({ lat: Number(lat), lng: Number(lng) });
    return res.json({ mode: 'reverse', result });
  } catch (error: any) {
    console.error('[GEOCODE_ERROR]', error);
    return res.status(500).json({ error: error.message || 'Failed to geocode address.' });
  }
});

export default router;
