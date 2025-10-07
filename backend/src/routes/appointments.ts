import { Router, Request, Response } from 'express';
import Appointment from '../models/appointment';
import Clinic from '../models/clinic';
import User from '../models/user';

const router = Router();

// Get all appointments for a user
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const appointments = await Appointment.findAll({
      where: { patientId: parseInt(userId as string) },
      include: [
        {
          model: Clinic,
          as: 'clinic',
          attributes: ['id', 'name', 'address', 'phone'],
        },
      ],
      order: [['appointmentDate', 'ASC']],
    });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Clinic,
          as: 'clinic',
          attributes: ['id', 'name', 'address', 'phone'],
        },
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

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
  const { patientId, clinicId, appointmentDate, status, notes } = req.body;

  if (!patientId || !clinicId || !appointmentDate) {
    return res.status(400).json({ error: 'patientId, clinicId, and appointmentDate are required' });
  }

  try {
    const appointment = await Appointment.create({
      patientId,
      clinicId,
      appointmentDate,
      status: status || 'pending',
      notes: notes || '',
    });

    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.update(req.body);
    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.destroy();
    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
