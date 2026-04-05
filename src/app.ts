import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './db';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import experienceRoutes from './routes/experience.routes';
import bookingRoutes from './routes/booking.routes';  // NEW

dotenv.config();

const app = express();

// Middlewares
app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await testDatabaseConnection();
  
  res.json({ 
    status: dbConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', experienceRoutes);
app.use('/api', bookingRoutes);  // NEW

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handler
app.use(errorHandler);

export default app;