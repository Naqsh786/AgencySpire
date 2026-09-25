import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import contactRoutes from './routes/contact.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AgencySpire API is running' });
});

app.use('/api', contactRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

app.use(errorHandler);

export default app;
