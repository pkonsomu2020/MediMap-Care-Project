import { Router, Request, Response } from 'express';
import { googlePlacesService } from '../services/googlePlaces';

const router = Router();

/**
 * GET /api/places/nearby
 * Fetch nearby hospitals/clinics using Google Places API
 * Query params: lat, lng, radius, type
 */
router.get('/nearby', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { lat, lng, radius = '5000', type = 'hospital' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = parseInt(radius as string);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      return res.status(400).json({ 
        error: 'Invalid latitude, longitude, or radius' 
      });
    }

    // First, try to get cached results from Supabase
    const cachedClinics = await googlePlacesService.getCachedClinics(
      latitude, 
      longitude, 
      radiusMeters / 1000 // Convert to km
    );

    // If we have enough cached results, return them
    if (cachedClinics.length >= 5) {
      res.setHeader('Cache-Control', 'no-store');
      return res.json({
        clinics: cachedClinics,
        source: 'cache',
        count: cachedClinics.length
      });
    }

    // Otherwise, fetch from Google Places API
    const places = await googlePlacesService.searchNearbyHospitals(
      latitude,
      longitude,
      radiusMeters,
      type as string
    );

    // Save to Supabase for future use
    const savedClinics = await googlePlacesService.saveClinicsToSupabase(places);

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      clinics: savedClinics,
      source: 'google_places',
      count: savedClinics.length
    });

  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch nearby places',
      details: error instanceof Error ? error.message : 'Unknown error'
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
      details: error instanceof Error ? error.message : 'Unknown error'
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
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const location = await googlePlacesService.geocodeAddress(address);
    return res.json(location);
  } catch (error: any) {
    console.error('[GEOCODE_ERROR]', error);
    return res.status(500).json({ error: error.message || 'Failed to geocode address.' });
  }
});

export default router;
