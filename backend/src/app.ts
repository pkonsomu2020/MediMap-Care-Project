import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
import sequelize from './sequelize';
import './models/user'; // Import models to register them
import './models/clinic';
import './models/appointment';
import './models/review';

// Import models for associations
import User from './models/user';
import Clinic from './models/clinic';
import Appointment from './models/appointment';
import Review from './models/review';

// Define associations
User.hasMany(Clinic, { foreignKey: 'userId', as: 'clinics' });
Clinic.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Clinic.hasMany(Appointment, { foreignKey: 'clinicId', as: 'appointments' });
Appointment.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

User.hasMany(Review, { foreignKey: 'patientId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Clinic.hasMany(Review, { foreignKey: 'clinicId', as: 'reviews' });
Review.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Sync database
sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database sync error:', err));

// Routes
import indexRouter from './routes/index';

app.use('/api', indexRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
