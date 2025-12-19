import { Router } from 'express';
import usersRouter from './users';
import clinicsRouter from './clinics';
import appointmentsRouter from './appointments';
import reviewsRouter from './reviews';
import placesRouter from './places';
import directionsRouter from './directions';
import healthRouter from '../health/health.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to MediMap Care API' });
});

router.use('/', healthRouter);
router.use('/users', usersRouter);
router.use('/clinics', clinicsRouter);
router.use('/appointments', appointmentsRouter);
router.use('/reviews', reviewsRouter);
router.use('/places', placesRouter);
router.use('/directions', directionsRouter);

export default router;

