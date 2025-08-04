import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Backend running in minimal mode'
  });
});

// Basic API endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'Seraphim Vanguard API - Minimal Mode',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[MINIMAL MODE] Seraphim Vanguard Backend running on port ${PORT}`);
  console.log(`[MINIMAL MODE] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[MINIMAL MODE] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;