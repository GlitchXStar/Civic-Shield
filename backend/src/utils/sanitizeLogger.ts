import { Request } from 'express';

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'jwt',
  'authorization',
  'cookie',
  'secret',
  'creditCard'
];

/**
 * Strips sensitive fields out of a payload object before logging.
 */
export function sanitizePayload(payload: any): any {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(sanitizePayload);
  }

  const sanitized = { ...payload };
  
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }

  return sanitized;
}
