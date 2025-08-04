import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

export const authSchemas = {
  register: Joi.object({
    email: commonValidations.email.required(),
    password: commonValidations.password.required(),
    displayName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('admin', 'ai_risk_officer', 'compliance_reviewer', 'user').default('user'),
    organizationId: Joi.string().uuid().optional(),
  }),

  login: Joi.object({
    email: commonValidations.email.required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    displayName: Joi.string().min(2).max(50).optional(),
    phoneNumber: commonValidations.phone.optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonValidations.password.required(),
  }),

  resetPassword: Joi.object({
    email: commonValidations.email.required(),
  }),

  updateRole: Joi.object({
    role: Joi.string().valid('admin', 'ai_risk_officer', 'compliance_reviewer', 'user').required(),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),
};