import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Audit logger for compliance tracking
const auditFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

export const auditLogger = winston.createLogger({
  level: 'info',
  format: auditFormat,
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Security logger for security events
export const securityLogger = winston.createLogger({
  level: 'info',
  format: auditFormat,
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'security.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Helper functions for structured logging
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logAuditEvent = (event: {
  action: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  result: 'success' | 'failure';
  reason?: string;
}) => {
  auditLogger.info({
    timestamp: new Date().toISOString(),
    ...event,
  });
};

export const logSecurityEvent = (event: {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) => {
  securityLogger.info({
    timestamp: new Date().toISOString(),
    ...event,
  });
};