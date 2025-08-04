import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, stream } from '../utils/logger';

// Extend Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Log request
  logger.http({
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.uid,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || 0);
    
    logger.http({
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      userId: (req as any).user?.uid,
    });

    // Log slow requests
    if (duration > 1000) {
      logger.warn({
        message: 'Slow request detected',
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

// Morgan stream configuration for HTTP logging
export const morganStream = stream;

// Request ID middleware
export const attachRequestId = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.requestId) {
    req.requestId = uuidv4();
  }
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log performance metrics for slow requests
    if (duration > 500) {
      logger.warn({
        message: 'Performance warning',
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

// Sanitize sensitive data from logs
export const sanitizeLogData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'ssn',
    'creditCard',
    'cvv',
  ];

  const sanitized = { ...data };

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });

  return sanitized;
};

// Request body logger (with sanitization)
export const logRequestBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug({
      message: 'Request body',
      requestId: req.requestId,
      body: sanitizeLogData(req.body),
    });
  }
  
  next();
};