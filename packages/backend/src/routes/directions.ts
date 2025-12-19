import { Router, Request, Response } from 'express';
import { googlePlacesService } from '../services/googlePlaces';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { origin, destination } = req.body;

  if (!origin || !origin.lat || !origin.lng || !destination || !destination.lat || !destination.lng) {
    return res.status(400).json({ error: 'Origin and destination with lat/lng are required.' });
  }

  try {
    const directions = await googlePlacesService.getDirections(origin, destination);
    return res.json(directions);
  } catch (error: any) {
    console.error('[DIRECTIONS_ERROR]', error);
    return res.status(500).json({ error: error.message || 'Failed to get directions.' });
  }
});

export default router;