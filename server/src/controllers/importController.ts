import { Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import { Family, Member } from '../models';
import { AuthRequest } from '../middlewares/jwtAuth';

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

const parseBoolean = (value: unknown, trueWord: string, falseWord: string): boolean => {
  if (typeof value === 'boolean') return value;
  const str = String(value ?? '').trim().toLowerCase();
  if (str === trueWord.toLowerCase()) return true;
  if (str === falseWord.toLowerCase()) return false;
  return true; // default
};

const getCell = (row: ExcelJS.Row, col: number): string =>
  String(row.getCell(col).value ?? '').trim();

export const importFamilies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Aucun fichier fourni' });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer as any);
    const sheet = workbook.worksheets[0];

    const result: ImportResult = { created: 0, skipped: 0, errors: [] };

    // Skip header row (row 1)
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const name = getCell(row, 1);
      if (!name) {
        result.skipped++;
        return;
      }

      const phone = getCell(row, 2) || null;
      const email = getCell(row, 3) || null;
      const address = getCell(row, 4) || null;
      const statutRaw = getCell(row, 5);
      const isActive = statutRaw.toLowerCase() !== 'inactif';

      Family.create({ name, phone, email, address, isActive })
        .then(() => { result.created++; })
        .catch((err: Error) => {
          result.errors.push(`Ligne ${rowNumber}: ${err.message}`);
        });
    });

    // Wait a tick for all async creates to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json(result);
  } catch (err) { next(err); }
};

export const importMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Aucun fichier fourni' });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer as any);
    const sheet = workbook.worksheets[0];

    // Pre-load all families for name lookup
    const allFamilies = await Family.findAll();
    const familyMap = new Map(allFamilies.map(f => [f.name.toLowerCase(), f.id]));

    const result: ImportResult = { created: 0, skipped: 0, errors: [] };
    const promises: Promise<void>[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const firstName = getCell(row, 1);
      const lastName = getCell(row, 2);
      const familyName = getCell(row, 3);

      if (!firstName || !lastName || !familyName) {
        result.skipped++;
        return;
      }

      const familyId = familyMap.get(familyName.toLowerCase());
      if (!familyId) {
        result.errors.push(`Ligne ${rowNumber}: Famille introuvable "${familyName}"`);
        return;
      }

      const birthDateRaw = getCell(row, 4);
      const weightRaw = getCell(row, 5);
      const statutRaw = getCell(row, 6);
      const birthDate = birthDateRaw ? new Date(birthDateRaw) : null;
      const weight = weightRaw ? parseFloat(weightRaw) : null;
      const isActive = statutRaw.toLowerCase() !== 'inactif';

      promises.push(
        Member.create({ firstName, lastName, familyId, birthDate, weight, isActive })
          .then(() => { result.created++; })
          .catch((err: Error) => {
            result.errors.push(`Ligne ${rowNumber}: ${err.message}`);
          })
      );
    });

    await Promise.all(promises);

    res.json(result);
  } catch (err) { next(err); }
};