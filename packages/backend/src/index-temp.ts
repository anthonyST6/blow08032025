import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
// import swaggerUi from 'swagger-ui-express';
import { initializeFirebase } from './config/firebase';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
// import { schedulerService } from './services/scheduler.service';
// import { swaggerSpec } from './config/swagger';
// import { emailService } from './services/email.service';

// Use dev WebSocket server if Firebase is not configured
const wsServerModule = process.env.FIREBASE_PROJECT_ID
  ? './websocket/server'
  : './websocket/server.dev';
const { wsServer } = require(wsServerModule);

// Routes
import authRoutes from './routes/auth.routes';
import llmRoutes from './routes/llm.routes';
import agentRoutes from './routes/agent.routes';
import auditRoutes from './routes/audit.routes';
import workflowRoutes from './routes/workflow.routes';
import adminRoutes from './routes/admin.routes';
import authDevRoutes from './routes/auth.dev';
import energyRoutes from './routes/energy.routes';
import energyExtendedRoutes from './routes/energy-extended.routes';
import useCaseRoutes from './routes/usecase.routes';

// Initialize Firebase
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for WebSocket support
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API Documentation (Swagger UI) - temporarily disabled
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'Seraphim Vanguard API Documentation',
// }));

// Development routes (only in development mode)
if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PROJECT_ID) {
  // Mount dev routes first so they take precedence
  app.use('/api/auth', authDevRoutes);
  logger.info('Development auth routes enabled');
} else {
  // Production routes
  app.use('/api/auth', authRoutes);
}

// Other API Routes
app.use('/api/llm', llmRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/energy', energyExtendedRoutes);
app.use('/api', useCaseRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize WebSocket server
wsServer.initialize(httpServer);

// Initialize scheduler service
// schedulerService.initialize().catch(error => {
//   logger.error('Failed to initialize scheduler:', error);
// });

// Initialize email service if enabled
// if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
//   emailService.initialize().catch(error => {
//     logger.error('Failed to initialize email service:', error);
//   });
// }

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Seraphim Vanguard Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('WebSocket server initialized');
  // logger.info('Scheduler service initialized');
  // logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  // if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
  //   logger.info('Email notifications enabled');
  // }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    wsServer.shutdown();
    // schedulerService.shutdown();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    wsServer.shutdown();
    // schedulerService.shutdown();
    process.exit(0);
  });
});

export default app;