import { Request, Response, NextFunction } from 'express';
import { log } from '../services/activityLogService';
import * as memberService from '../services/memberService';

export const getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user!.role === 'admin';
    res.json(await memberService.getAllMembers(includeInactive));
  } catch (err) { next(err); }
};

export const createMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, familyId, birthDate, weight } = req.body;

    if (!firstName || !lastName || !familyId) {
      res.status(400).json({ error: 'Prénom, nom et identifiant de famille sont obligatoires' }); return;
    }
    if (weight !== undefined && weight !== null) {
      const w = parseFloat(weight);
      if (isNaN(w) || w <= 0 || w > 500) { res.status(400).json({ error: 'Le poids doit être un nombre positif (max 500 kg)' }); return; }
    }
    if (birthDate && new Date(birthDate) > new Date()) {
      res.status(400).json({ error: 'La date de naissance ne peut pas être dans le futur' }); return;
    }

    const { member, familyName } = await memberService.createMember({ firstName, lastName, familyId, birthDate, weight });
    await log(req.user!.id, 'CREATE_MEMBER', `Création du membre ${firstName} ${lastName} dans la famille ${familyName}`, 'Member', member.id);
    res.status(201).json(member);
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};

export const getMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (req.user!.role === 'family') {
      const m = await memberService.getMemberById(id);
      if (!m) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
      if ((m as any).familyId !== req.user!.familyId) { res.status(403).json({ error: 'Accès refusé à ce membre' }); return; }
    }
    const member = await memberService.getMemberById(id);
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    res.json(member);
  } catch (err) { next(err); }
};

export const updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, birthDate, weight, familyId } = req.body;
    if (weight !== undefined && weight !== null && weight !== '') {
      const w = parseFloat(weight);
      if (isNaN(w) || w <= 0 || w > 500) { res.status(400).json({ error: 'Le poids doit être un nombre positif (max 500 kg)' }); return; }
    }
    if (birthDate && new Date(birthDate) > new Date()) {
      res.status(400).json({ error: 'La date de naissance ne peut pas être dans le futur' }); return;
    }
    const member = await memberService.updateMemberById(req.params.id as string, { firstName, lastName, birthDate, weight, familyId });
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    res.json(member);
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};

export const deactivateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await memberService.deactivateMemberById(req.params.id as string);
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    res.json({ message: 'Membre désactivé avec succès' });
  } catch (err) { next(err); }
};

export const reactivateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await memberService.reactivateMemberById(req.params.id as string);
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    await log(req.user!.id, 'REACTIVATE_MEMBER', `Réactivation du membre ${member.firstName} ${member.lastName}`, 'Member', member.id);
    res.json({ message: 'Membre réactivé avec succès', member });
  } catch (err) { next(err); }
};


export const getMemberAttendances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const member = await memberService.getMemberById(id);
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    if (req.user!.role === 'family' && (member as any).familyId !== req.user!.familyId) {
      res.status(403).json({ error: 'Accès refusé à ce membre' }); return;
    }
    const attendances = await memberService.getMemberAttendancesById(id);
    res.json(attendances);
  } catch (err) { next(err); }
};

export const uploadPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const member = await memberService.getMemberById(id);
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    if (!req.file) { res.status(400).json({ error: 'Aucun fichier fourni' }); return; }
    await memberService.updateMemberById(id, {});
    res.json({ message: 'Photo mise à jour avec succès', photo: req.file.filename });
  } catch (err) { next(err); }
};

export const updateMemberWeight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const memberCheck = await memberService.getMemberById(id);
    if (!memberCheck) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    if (req.user!.role === 'family' && (memberCheck as any).familyId !== req.user!.familyId) {
      res.status(403).json({ error: 'Accès refusé à ce membre' }); return;
    }
    const { weight } = req.body;
    if (weight !== undefined && weight !== null && weight !== '') {
      const w = parseFloat(weight);
      if (isNaN(w) || w <= 0 || w > 500) { res.status(400).json({ error: 'Le poids doit être un nombre positif (max 500 kg)' }); return; }
    }
    const member = await memberService.updateMemberWeight(id, weight);
    res.json(member);
  } catch (err) { next(err); }
};

export const changeMemberFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { familyId } = req.body;
    const member = await memberService.changeMemberFamilyById(id, { familyId });
    if (!member) { res.status(404).json({ error: 'Membre non trouvé' }); return; }
    await log(req.user!.id, 'CHANGE_MEMBER_FAMILY', `Changement de famille de ${member.firstName} ${member.lastName}`, 'Member', member.id);
    res.json({ message: 'Membre mis à jour avec succès', member });
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};