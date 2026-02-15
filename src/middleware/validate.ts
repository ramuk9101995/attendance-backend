import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error during validation',
      });
      return;
    }
  };
};
