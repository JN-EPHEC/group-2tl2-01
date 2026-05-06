import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/jwtAuth';
import { logActivity } from '../services/activityLogService';
import * as courseService from '../services/courseService';

export const getCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to, courseTypeId } = req.query as Record<string, string>;
    res.json(await courseService.getAllCourses({ from, to, courseTypeId }));
  } catch (err) { next(err); }
};

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, time, courseTypeId, notes } = req.body;
    if (!date || !time || !courseTypeId) {
      res.status(400).json({ error: 'Date, heure et type de cours sont obligatoires' }); return;
    }
    const { course, courseTypeName } = await courseService.createCourse({ date, time, courseTypeId, notes, createdBy: req.user!.id });
    await logActivity(req.user!.id, 'CREATE_COURSE', `Création cours ${courseTypeName} du ${date}`, 'Course', course.id);
    res.status(201).json(course);
  } catch (err) { next(err); }
};

export const getCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) { res.status(404).json({ error: 'Cours non trouvé' }); return; }
    res.json(course);
  } catch (err) { next(err); }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.updateCourseById(req.params.id, req.body);
    if (!course) { res.status(404).json({ error: 'Cours non trouvé' }); return; }
    res.json(course);
  } catch (err) { next(err); }
};

export const addAttendances = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { memberIds } = req.body as { memberIds: string[] };
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400).json({ error: 'Liste de membres requise' }); return;
    }
    const result = await courseService.addAttendancesToCourse(req.params.id, memberIds);
    if (!result) { res.status(404).json({ error: 'Cours non trouvé' }); return; }

    for (const memberId of result.added) {
      await logActivity(req.user!.id, 'ADD_ATTENDANCE', `Présence ajoutée au cours du ${result.course.date}`, 'Attendance', req.params.id);
    }
    res.status(201).json({ added: result.added, alreadyPresent: result.alreadyPresent, noCredits: result.noCredits });
  } catch (err) { next(err); }
};

export const removeAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await courseService.removeAttendanceFromCourse(req.params.id, req.params.memberId);
    if (!result) { res.status(404).json({ error: 'Présence non trouvée' }); return; }
    await logActivity(req.user!.id, 'REMOVE_ATTENDANCE',
      `Suppression présence: ${result.member?.firstName} ${result.member?.lastName} du cours du ${result.course?.date}`,
      'Attendance', req.params.id);
    res.json({ message: 'Présence supprimée' });
  } catch (err) { next(err); }
};
