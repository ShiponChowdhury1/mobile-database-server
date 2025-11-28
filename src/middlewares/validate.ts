import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

/**
 * Middleware to validate request body using Zod schema
 */
export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Validation error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};
