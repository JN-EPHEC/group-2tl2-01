import { Response, NextFunction } from 'express';
import { ActivityLog, User } from '../models';
import { AuthRequest } from '../middlewares/jwtAuth';

export const getActivityLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const { count, rows } = await ActivityLog.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit, offset,
    });
    res.json({ total: count, page, limit, totalPages: Math.ceil(count / limit), logs: rows });
  } catch (err) { next(err); }
};