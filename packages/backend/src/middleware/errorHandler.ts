import { Request, Response, NextFunction } from 'express';
import { logError, logSecurityEvent } from '../utils/logger';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common API errors
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, true, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, true);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message, true);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, true);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, true);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(429, message, true);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', details?: any) {
    super(500, message, false, details);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.uid,
  });

  // Handle specific error types
  if (err instanceof ApiError) {
    // Log security events for certain errors
    if (err.statusCode === 401 || err.statusCode === 403) {
      logSecurityEvent({
        type: 'unauthorized_access_attempt',
        severity: 'medium',
        userId: (req as any).user?.uid,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          url: req.url,
          method: req.method,
          error: err.message,
        },
      });
    }

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
        timestamp: new Date().toISOString(),
        path: req.url,
      },
    });
    return;
  }

  // Handle Firebase Auth errors
  if (err.message?.includes('Firebase')) {
    res.status(401).json({
      error: {
        message: 'Authentication error',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path: req.url,
      },
    });
    return;
  }

  // Handle validation errors from Joi
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: {
        message: 'Validation error',
        statusCode: 400,
        details: err.message,
        timestamp: new Date().toISOString(),
        path: req.url,
      },
    });
    return;
  }

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.url,
    },
  });
};