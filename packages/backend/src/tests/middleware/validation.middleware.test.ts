import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { validateRequest, validateQuery, validateParams } from '../../middleware/validation';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateRequest', () => {
    it('should validate request body successfully', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      mockRequest.body = {
        name: 'John Doe',
        age: 30,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({
        name: 'John Doe',
        age: 30,
      });
    });

    it('should reject invalid request body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      mockRequest.body = {
        name: 'John Doe',
        age: 'thirty', // Invalid: should be number
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
        })
      );
    });

    it('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = {
        name: 'John Doe',
        unknownField: 'should be removed',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({
        name: 'John Doe',
      });
    });

    it('should handle missing required fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {
        name: 'John Doe',
        // email is missing
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
        })
      );
    });

    it('should validate complex nested objects', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          profile: Joi.object({
            age: Joi.number().required(),
            interests: Joi.array().items(Joi.string()),
          }),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'John Doe',
          profile: {
            age: 30,
            interests: ['coding', 'reading'],
          },
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery', () => {
    it('should validate query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
      });

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it('should reject invalid query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().min(1),
      });

      mockRequest.query = {
        page: 'invalid',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Query validation failed',
        })
      );
    });
  });

  describe('validateParams', () => {
    it('should validate route parameters', () => {
      const schema = Joi.object({
        id: Joi.string().uuid(),
      });

      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid route parameters', () => {
      const schema = Joi.object({
        id: Joi.string().uuid(),
      });

      mockRequest.params = {
        id: 'not-a-uuid',
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Parameter validation failed',
        })
      );
    });
  });
});