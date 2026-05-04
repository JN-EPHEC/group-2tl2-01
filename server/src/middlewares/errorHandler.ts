
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error('Erreur:', err);

  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
  });
};