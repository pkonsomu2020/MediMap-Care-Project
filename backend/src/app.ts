import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { buildCors } from './config/cors';

const app = express();
app.set('etag', false);

// Middleware
app.use(helmet());
app.use(buildCors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
import indexRouter from './routes/index';
import directionsRouter from './routes/directions';

app.use('/api', indexRouter);
app.use('/api/directions', directionsRouter);

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
