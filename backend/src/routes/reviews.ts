import { Router, Request, Response } from 'express';
import Review from '../models/review';
import Clinic from '../models/clinic';
import User from '../models/user';

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

    const reviews = await Review.findAll({
      where: { clinicId },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new review
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  const { patientId, clinicId, rating, comment } = req.body;

  if (!patientId || !clinicId || !rating) {
    return res.status(400).json({ error: 'patientId, clinicId, and rating are required' });
  }

  const clinicIdNumber = parseInt(clinicId);
  if (isNaN(clinicIdNumber)) {
    return res.status(400).json({ error: 'clinicId must be a valid number' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  try {
    // Check if clinic exists
    const clinic = await Clinic.findByPk(clinicIdNumber);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const review = await Review.create({
      patientId,
      clinicId: clinicIdNumber,
      rating,
      comment: comment || '',
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
