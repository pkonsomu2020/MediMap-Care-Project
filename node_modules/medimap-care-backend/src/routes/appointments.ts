import { Router, Request, Response } from 'express';
import { createAppointmentDb, deleteAppointmentDb, getAppointmentDb, listAppointmentsByUserDb, updateAppointmentDb, getClinicDb } from '../lib/data';

const router = Router();

// Get all appointments for a user
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const appointments = await listAppointmentsByUserDb(parseInt(userId as string));
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointment = await getAppointmentDb(parseInt(req.params.id));

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  const { user_id, clinic_id, date, time, status } = req.body;

  if (!user_id || !clinic_id || !date || !time) {
    return res.status(400).json({ error: 'user_id, clinic_id, date and time are required' });
  }

  try {
    const clinic = await getClinicDb(Number(clinic_id));
    if (!clinic) return res.status(400).json({ error: 'Invalid clinic_id' });
    const appointment = await createAppointmentDb({ user_id, clinic_id, date, time, status });
    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const existing = await getAppointmentDb(id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    const allowed: any = {};
    if (req.body.status) allowed.status = req.body.status;
    if (req.body.date) allowed.date = req.body.date;
    if (req.body.time) allowed.time = req.body.time;
    const updated = await updateAppointmentDb(id, allowed);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const existing = await getAppointmentDb(id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    await deleteAppointmentDb(id);
    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
