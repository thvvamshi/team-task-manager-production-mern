import { HttpError } from '../utils/httpError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const details = result.error.flatten();
      return next(new HttpError(400, 'Validation failed', details));
    }

    req.validated = result.data;
    next();
  };
}
