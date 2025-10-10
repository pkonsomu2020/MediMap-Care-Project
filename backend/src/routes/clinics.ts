import { Router, Request, Response } from 'express';
import { createClinicDb, getClinicDb, listClinicsDb, updateClinicDb, deleteClinicDb } from '../lib/data';

const router = Router();

// Get all clinics with optional filters
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { q, min_rating, limit, offset } = req.query as {
      q?: string;
      min_rating?: string;
      limit?: string;
      offset?: string;
    };

    const filters: { q?: string; min_rating?: number; limit?: number; offset?: number } = {};

    if (q) filters.q = q;
    if (min_rating) filters.min_rating = parseFloat(min_rating);
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    const clinics = await listClinicsDb(filters);
    return res.json(clinics);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Get clinic by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    const clinic = await getClinicDb(id);

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    return res.json(clinic);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new clinic
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  const { name, address, latitude, longitude, services, consultation_fee, contact } = req.body;

  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'name, latitude and longitude are required' });
  }

  try {
    const clinic = await createClinicDb({
      name,
      address: address || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      services: services || null,
      consultation_fee: consultation_fee !== undefined ? parseFloat(consultation_fee) : null,
      contact: contact || null,
    });

    return res.status(201).json(clinic);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update clinic
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    const existing = await getClinicDb(id);
    if (!existing) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const allowed: any = {};
    if (req.body.name !== undefined) allowed.name = req.body.name;
    if (req.body.address !== undefined) allowed.address = req.body.address ?? null;
    if (req.body.latitude !== undefined) allowed.latitude = parseFloat(String(req.body.latitude));
    if (req.body.longitude !== undefined) allowed.longitude = parseFloat(String(req.body.longitude));
    if (req.body.services !== undefined) allowed.services = req.body.services ?? null;
    if (req.body.consultation_fee !== undefined) allowed.consultation_fee = req.body.consultation_fee !== null ? parseFloat(String(req.body.consultation_fee)) : null;
    if (req.body.contact !== undefined) allowed.contact = req.body.contact ?? null;
    if (req.body.rating !== undefined) allowed.rating = parseFloat(String(req.body.rating));

    const updated = await updateClinicDb(id, allowed);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete clinic
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    const existing = await getClinicDb(id);
    if (!existing) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    await deleteClinicDb(id);
    return res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
