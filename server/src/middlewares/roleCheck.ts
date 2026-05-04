import { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'coach' | 'family';

export const roleCheck = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentification requise' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé: droits insuffisants' });
      return;
    }

    next();
  };
};