import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource id' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', details: err.keyValue });
  }

  const statusCode = err.statusCode || 500;
  const payload = {
    message: err.message || 'Internal server error'
  };

  if (err.details) payload.details = err.details;
  if (!env.isProduction && statusCode === 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
