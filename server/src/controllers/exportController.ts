import { Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import { Family, Member, Attendance, Course, CourseType, CreditPurchase, ActivityLog, User } from '../models';
import { AuthRequest } from '../middlewares/jwtAuth';
import { getFamilyTotalCredits } from '../services/creditService';

const sendWorkbook = async (res: Response, workbook: ExcelJS.Workbook, filename: string): Promise<void> => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

export const exportFamilies = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const families = await Family.findAll();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Familles');
    sheet.columns = [
      { header: 'Nom', key: 'name', width: 25 },
      { header: 'Téléphone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Adresse', key: 'address', width: 40 },
      { header: 'Statut', key: 'isActive', width: 10 },
      { header: 'Crédits disponibles', key: 'credits', width: 18 },
    ];
    for (const f of families) {
      const credits = await getFamilyTotalCredits(f.id);
      sheet.addRow({ ...f.toJSON(), isActive: f.isActive ? 'Actif' : 'Inactif', credits });
    }
    await sendWorkbook(res, workbook, 'familles.xlsx');
  } catch (err) { next(err); }
};

export const exportMembers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await Member.findAll({ include: [{ model: Family, as: 'family', attributes: ['name'] }] });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Membres');
    sheet.columns = [
      { header: 'Prénom', key: 'firstName', width: 20 },
      { header: 'Nom', key: 'lastName', width: 20 },
      { header: 'Famille', key: 'family', width: 25 },
      { header: 'Date de naissance', key: 'birthDate', width: 18 },
      { header: 'Poids (kg)', key: 'weight', width: 12 },
      { header: 'Statut', key: 'isActive', width: 10 },
    ];
    members.forEach(m => sheet.addRow({
      firstName: m.firstName, lastName: m.lastName,
      family: (m as any).family?.name || '',
      birthDate: m.birthDate, weight: m.weight,
      isActive: m.isActive ? 'Actif' : 'Inactif',
    }));
    await sendWorkbook(res, workbook, 'membres.xlsx');
  } catch (err) { next(err); }
};

export const exportAttendances = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attendances = await Attendance.findAll({
      include: [
        { model: Member, as: 'member', attributes: ['firstName', 'lastName'] },
        { model: Course, as: 'course', include: [{ model: CourseType, as: 'courseType', attributes: ['name'] }] },
      ],
      order: [[{ model: Course, as: 'course' }, 'date', 'DESC']],
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Présences');
    sheet.columns = [
      { header: 'Membre', key: 'member', width: 30 },
      { header: 'Type de cours', key: 'courseType', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Heure', key: 'time', width: 10 },
    ];
    attendances.forEach(a => sheet.addRow({
      member: `${(a as any).member?.firstName} ${(a as any).member?.lastName}`,
      courseType: (a as any).course?.courseType?.name || '',
      date: (a as any).course?.date || '',
      time: (a as any).course?.time || '',
    }));
    await sendWorkbook(res, workbook, 'presences.xlsx');
  } catch (err) { next(err); }
};

export const exportCredits = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const purchases = await CreditPurchase.findAll({
      include: [
        { model: Family, as: 'family', attributes: ['name'] },
        { model: Member, as: 'member', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'addedByUser', attributes: ['firstName', 'lastName'] },
      ],
      order: [['purchaseDate', 'DESC']],
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Crédits');
    sheet.columns = [
      { header: 'Famille / Membre', key: 'target', width: 30 },
      { header: 'Montant ajouté', key: 'amount', width: 15 },
      { header: 'Restant', key: 'remaining', width: 10 },
      { header: 'Note', key: 'note', width: 30 },
      { header: 'Ajouté par', key: 'addedBy', width: 25 },
      { header: 'Date', key: 'purchaseDate', width: 15 },
    ];
    purchases.forEach(p => sheet.addRow({
      target: (p as any).family?.name || `${(p as any).member?.firstName} ${(p as any).member?.lastName}`,
      amount: p.amount, remaining: p.remaining, note: p.note || '',
      addedBy: `${(p as any).addedByUser?.firstName} ${(p as any).addedByUser?.lastName}`,
      purchaseDate: p.purchaseDate,
    }));
    await sendWorkbook(res, workbook, 'credits.xlsx');
  } catch (err) { next(err); }
};

export const exportActivityLog = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await ActivityLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Journal');
    sheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Utilisateur', key: 'user', width: 25 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Détails', key: 'details', width: 50 },
    ];
    logs.forEach(l => sheet.addRow({
      date: l.createdAt,
      user: (l as any).user ? `${(l as any).user.firstName} ${(l as any).user.lastName}` : 'Système',
      action: l.action, details: l.details || '',
    }));
    await sendWorkbook(res, workbook, 'journal.xlsx');
  } catch (err) { next(err); }
};
