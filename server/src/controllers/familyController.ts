import { Request, Response, NextFunction } from 'express';
import { log } from '../services/activityLogService';
import * as familyService from '../services/familyService';

const PHONE_REGEX = /^[0-9\s\+\-\(\)\.]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getFamilies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await familyService.getAllFamilies());
  } catch (err) { next(err); }
};

export const createFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, email, address, responsibleFirstName, responsibleLastName, responsibleEmail, responsiblePassword } = req.body;

    if (!name) { res.status(400).json({ error: 'Le nom de la famille est obligatoire' }); return; }
    if (phone && !PHONE_REGEX.test(phone)) { res.status(400).json({ error: 'Numéro de téléphone invalide (chiffres uniquement)' }); return; }
    if (email && !EMAIL_REGEX.test(email)) { res.status(400).json({ error: 'Adresse email invalide' }); return; }
    if (!responsibleFirstName || !responsibleLastName || !responsibleEmail || !responsiblePassword) {
      res.status(400).json({ error: 'Les informations du responsable sont obligatoires' }); return;
    }

    const { family, responsibleUser } = await familyService.createFamilyWithResponsible({
      name, phone, email, address, responsibleFirstName, responsibleLastName, responsibleEmail, responsiblePassword,
    });

    await log(req.user!.id, 'CREATE_FAMILY', `Création de la famille ${name} avec le compte responsable ${responsibleEmail}`, 'Family', family.id);
    res.status(201).json({ ...family.toJSON(), responsibleUser });
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};

export const getFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (req.user!.role === 'family' && req.user!.familyId !== id) {
      res.status(403).json({ error: 'Accès refusé à cette famille' }); return;
    }
    const family = await familyService.getFamilyById(id);
    if (!family) { res.status(404).json({ error: 'Famille non trouvée' }); return; }
    res.json(family);
  } catch (err) { next(err); }
};

export const updateFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, email, address } = req.body;
    if (phone && !PHONE_REGEX.test(phone)) { res.status(400).json({ error: 'Numéro de téléphone invalide (chiffres uniquement)' }); return; }
    if (email && !EMAIL_REGEX.test(email)) { res.status(400).json({ error: 'Adresse email invalide' }); return; }

    const family = await familyService.updateFamilyById(req.params.id, { name, phone, email, address });
    if (!family) { res.status(404).json({ error: 'Famille non trouvée' }); return; }
    res.json(family);
  } catch (err) { next(err); }
};

export const deactivateFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const family = await familyService.deactivateFamilyById(req.params.id);
    if (!family) { res.status(404).json({ error: 'Famille non trouvée' }); return; }
    res.json({ message: 'Famille désactivée avec succès' });
  } catch (err) { next(err); }
};

export const updateFamilyContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (req.user!.role === 'family' && req.user!.familyId !== id) {
      res.status(403).json({ error: 'Accès refusé à cette famille' }); return;
    }
    const { email, phone } = req.body;
    if (phone && !PHONE_REGEX.test(phone)) { res.status(400).json({ error: 'Numéro de téléphone invalide (chiffres uniquement)' }); return; }
    if (email && !EMAIL_REGEX.test(email)) { res.status(400).json({ error: 'Adresse email invalide' }); return; }

    const family = await familyService.updateFamilyContactById(id, { email, phone });
    if (!family) { res.status(404).json({ error: 'Famille non trouvée' }); return; }
    res.json(family);
  } catch (err) { next(err); }
};

export const addCredits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, note } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Le montant doit être un nombre entier positif' }); return;
    }
    const result = await familyService.addCreditsToFamily(req.params.id, amount, note, req.user!.id);
    if (!result) { res.status(404).json({ error: 'Famille non trouvée' }); return; }
    await log(req.user!.id, 'ADD_CREDITS', `Ajout de ${amount} cours à la famille ${result.familyName}`, 'Family', req.params.id);
    res.status(201).json(result.creditPurchase);
  } catch (err) { next(err); }
};

export const getFamilyAttendances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (req.user!.role === 'family' && req.user!.familyId !== id) {
      res.status(403).json({ error: 'Accès refusé à cette famille' }); return;
    }
    const attendances = await familyService.getFamilyAttendancesById(id);
    if (attendances === null) { res.status(404).json({ error: 'Famille non trouvée' }); return; }
    res.json(attendances);
  } catch (err) { next(err); }
};
