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
    const maxResultCount = maxResults ? Number(maxResults) : 5;
    const typeList = types ? types.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
    const shouldBypassCache = skipCache === 'true' || radiusMode === 'drag';

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radiusKmNumber)) {
      return res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
    }

    console.log(`[API /nearby] Request: lat=${latitude}, lng=${longitude}, radiusKm=${radiusKmNumber}, bypassCache=${shouldBypassCache}`);

    const debug: Record<string, unknown> = {
      query: { latitude, longitude, radiusKm: radiusKmNumber, radiusMode, types: typeList, ranking, maxResultCount, skipCache: shouldBypassCache },
      source: 'cache',
    };

    let clinics: any[] = [];
    
    // First try cache (unless explicitly bypassed)
    if (!shouldBypassCache) {
      console.log(`[API /nearby] Checking cache first...`);
      clinics = await googlePlacesService.getCachedClinics(latitude, longitude, radiusKmNumber, typeList);
      console.log(`[API /nearby] Found ${clinics.length} clinics in cache`);
    } else {
      console.log(`[API /nearby] Cache bypassed, going directly to Google Places`);
    }

    // If cache is insufficient or bypassed, fetch from Google Places
    if (clinics.length < 5 || shouldBypassCache) {
      console.log(`[API /nearby] Cache insufficient (${clinics.length} < 5) or bypassed, calling Google Places API`);
      
      // Use DISTANCE ranking by default for proximity-based results
      const searchRanking = ranking || 'DISTANCE';
      
      console.log(`[API /nearby] Calling googlePlacesService.searchNearby...`);
      const nearbyResult = await googlePlacesService.searchNearby({
        latitude,
        longitude,
        radiusMeters,
        maxResultCount,
        ...(typeList && typeList.length > 0 ? { types: typeList } : {}),
        ranking: searchRanking,
      });

      console.log(`[API /nearby] Google Places returned ${nearbyResult.places.length} places`);
      
      if (nearbyResult.places[0]) {
        console.log(`[API /nearby] First place from Google:`, {
          id: nearbyResult.places[0].id,
          name: nearbyResult.places[0].displayName?.text,
          address: nearbyResult.places[0].formattedAddress
        });
        
        console.log(`[API /nearby] Calling saveClinicsToSupabase with ${nearbyResult.places.length} places...`);
        // Pass user coordinates to sort saved clinics by distance
        clinics = await googlePlacesService.saveClinicsToSupabase(nearbyResult.places, latitude, longitude);
        console.log(`[API /nearby] saveClinicsToSupabase returned ${clinics.length} clinics`);
      } else {
        console.log(`[API /nearby] No places returned from Google Places API`);
        clinics = [];
      }
      
      debug.source = 'google_places';
      debug.placesMeta = nearbyResult.meta;
      debug.placeCount = nearbyResult.places.length;
      debug.ranking = searchRanking;
    } else {
      console.log(`[API /nearby] Using ${clinics.length} clinics from cache`);
      debug.cachedCount = clinics.length;
    }

    console.log(`[API /nearby] Final response: ${clinics.length} clinics from source: ${debug.source}`);
    
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
    console.log("places: ", result)
    return res.json({ mode: 'reverse', result });

  } catch (error: any) {
    console.error('[GEOCODE_ERROR]', error);
    return res.status(500).json({ error: error.message || 'Failed to geocode address.' });
  }
});

export default router;
