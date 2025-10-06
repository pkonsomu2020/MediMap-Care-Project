import { Router, Request, Response } from 'express';
import Clinic from '../models/clinic';
import User from '../models/user';

const router = Router();

// Get all clinics with optional filters
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { specialty, latitude, longitude, radius = 10 } = req.query;
    let whereClause: any = {};

    if (specialty) {
      whereClause.specialty = specialty;
    }

    // If location is provided, filter by distance (simplified - in production use PostGIS)
    if (latitude && longitude) {
      // Implement distance calculation later
    }

    const clinics = await Clinic.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email'],
        },
      ],
    });

    return res.json(clinics);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get clinic by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const clinic = await Clinic.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email'],
        },
      ],
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    return res.json(clinic);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new clinic (clinic owners only)
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    address,
    latitude,
    longitude,
    phone,
    email,
    specialty,
    description,
    consultationFee,
    availability,
    userId,
  } = req.body;

  if (!name || !address || !latitude || !longitude || !phone || !email || !specialty || !consultationFee || !availability || !userId) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  try {
    const clinic = await Clinic.create({
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      phone,
      email,
      specialty,
      description,
      rating: 0.0,
      reviewCount: 0,
      consultationFee: parseFloat(consultationFee),
      availability,
      userId,
    });

    return res.status(201).json(clinic);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update clinic
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    await clinic.update(req.body);
    return res.json(clinic);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete clinic
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    await clinic.destroy();
    return res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
