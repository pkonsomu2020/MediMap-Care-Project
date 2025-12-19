import { Router, Request, Response } from 'express';
import { createReviewDb, listReviewsByClinicDb, getClinicDb } from '../lib/data';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get all reviews for a clinic
router.get('/clinic/:clinicId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const clinicIdParam = req.params.clinicId;
    if (!clinicIdParam) {
      return res.status(400).json({ error: 'clinicId is required' });
    }

    const clinicId = parseInt(clinicIdParam);
    if (isNaN(clinicId)) {
      return res.status(400).json({ error: 'clinicId must be a valid number' });
    }

    const reviews = await listReviewsByClinicDb(clinicId);

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new review
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { clinic_id, rating, comment } = req.body;

  if (!clinic_id || !rating) {
    return res.status(400).json({ error: 'clinic_id and rating are required' });
  }

  const clinicIdNumber = parseInt(clinic_id);
  if (isNaN(clinicIdNumber)) {
    return res.status(400).json({ error: 'clinicId must be a valid number' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  try {
    // Check if clinic exists
    const clinic = await getClinicDb(clinicIdNumber);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const review = await createReviewDb({ user_id: req.auth!.userId, clinic_id: clinicIdNumber, rating, comment });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
