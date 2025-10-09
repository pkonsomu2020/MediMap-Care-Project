import { Router, Request, Response } from 'express';
import { createAppointmentDb, deleteAppointmentDb, getAppointmentDb, listAppointmentsByUserDb, updateAppointmentDb, getClinicDb } from '../lib/data';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get all appointments for the authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.auth!.userId;
    const appointments = await listAppointmentsByUserDb(userId);
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const appointment = await getAppointmentDb(parseInt(id));

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.user_id !== req.auth!.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { clinic_id, date, time, status } = req.body;

  if (!clinic_id || !date || !time) {
    return res.status(400).json({ error: 'clinic_id, date and time are required' });
  }

  try {
    const clinic = await getClinicDb(Number(clinic_id));
    if (!clinic) return res.status(400).json({ error: 'Invalid clinic_id' });
    const appointment = await createAppointmentDb({ user_id: req.auth!.userId, clinic_id, date, time, status });
    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const appointmentId = parseInt(id);
    const existing = await getAppointmentDb(appointmentId);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    if (existing.user_id !== req.auth!.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const allowed: any = {};
    if (req.body.status) allowed.status = req.body.status;
    if (req.body.date) allowed.date = req.body.date;
    if (req.body.time) allowed.time = req.body.time;
    const updated = await updateAppointmentDb(appointmentId, allowed);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const appointmentId = parseInt(id);
    const existing = await getAppointmentDb(appointmentId);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    if (existing.user_id !== req.auth!.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await deleteAppointmentDb(appointmentId);
    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
