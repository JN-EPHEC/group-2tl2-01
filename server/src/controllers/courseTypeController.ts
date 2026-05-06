import { Request, Response, NextFunction } from 'express';
import { CourseType } from '../models';

export const getCourseTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user!.role === 'admin';
    const courseTypes = await CourseType.findAll({
      where: includeInactive ? {} : { isActive: true },
      order: [['name', 'ASC']],
    });
    res.json(courseTypes);
  } catch (err) {
    next(err);
  }
};

export const createCourseType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, color } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Le nom du type de cours est obligatoire' });
      return;
    }

    const existing = await CourseType.findOne({ where: { name } });
    if (existing) {
      res.status(409).json({ error: 'Un type de cours avec ce nom existe déjà' });
      return;
    }

    const courseType = await CourseType.create({
      name,
      color: color || null,
    });

    res.status(201).json(courseType);
  } catch (err) {
    next(err);
  }
};

export const updateCourseType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseType = await CourseType.findByPk(req.params.id);

    if (!courseType) {
      res.status(404).json({ error: 'Type de cours non trouvé' });
      return;
    }

    const { name, color } = req.body;

    if (name && name !== courseType.name) {
      const existing = await CourseType.findOne({ where: { name } });
      if (existing) {
        res.status(409).json({ error: 'Un type de cours avec ce nom existe déjà' });
        return;
      }
    }

    await courseType.update({
      ...(name && { name }),
      ...(color !== undefined && { color: color || null }),
    });

    res.json(courseType);
  } catch (err) {
    next(err);
  }
};

export const deactivateCourseType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseType = await CourseType.findByPk(req.params.id);

    if (!courseType) {
      res.status(404).json({ error: 'Type de cours non trouvé' });
      return;
    }

    await courseType.update({ isActive: false });

    res.json({ message: 'Type de cours désactivé avec succès' });
  } catch (err) {
    next(err);
  }
};

export const reactivateCourseType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseType = await CourseType.findByPk(req.params.id);

    if (!courseType) {
      res.status(404).json({ error: 'Type de cours non trouvé' });
      return;
    }

    await courseType.update({ isActive: true });

    res.json({ message: 'Type de cours réactivé avec succès', courseType });
  } catch (err) {
    next(err);
  }
};