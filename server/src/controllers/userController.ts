import { Request, Response, NextFunction } from 'express';
import { log } from '../services/activityLogService';
import * as userService from '../services/userService';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await userService.getAllUsers());
  } catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, familyId } = req.body;
    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({ error: 'Champs obligatoires manquants: email, mot de passe, rôle, prénom, nom' }); return;
    }
    const user = await userService.createUser({ email, password, role, firstName, lastName, familyId });
    await log(req.user!.id, 'CREATE_USER', `Création de l'utilisateur ${firstName} ${lastName} (${role})`, 'User', (user as any).id);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id as string);
    if (!user) { res.status(404).json({ error: 'Utilisateur non trouvé' }); return; }
    res.json(user);
  } catch (err) { next(err); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, firstName, lastName, role, familyId } = req.body;
    const user = await userService.updateUserById(req.params.id as string, { email, firstName, lastName, role, familyId }, req.user!.id);
    if (!user) { res.status(404).json({ error: 'Utilisateur non trouvé' }); return; }
    await log(req.user!.id, 'UPDATE_PROFILE', `Mise à jour du profil de ${(user as any).firstName} ${(user as any).lastName}`, 'User', req.params.id as string);
    res.json(user);
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};

export const deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.deactivateUserById(req.params.id as string, req.user!.id);
    if (!user) { res.status(404).json({ error: 'Utilisateur non trouvé' }); return; }
    await log(req.user!.id, 'DEACTIVATE_ACCOUNT', `Désactivation du compte de ${user.firstName} ${user.lastName}`, 'User', req.params.id as string);
    res.json({ message: 'Compte désactivé avec succès' });
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ error: err.message }); return; }
    next(err);
  }
};

export const reactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.reactivateUserById(req.params.id as string);
    if (!user) { res.status(404).json({ error: 'Utilisateur non trouvé' }); return; }
    await log(req.user!.id, 'REACTIVATE_ACCOUNT', `Réactivation du compte de ${user.firstName} ${user.lastName}`, 'User', req.params.id as string);
    res.json({ message: 'Compte réactivé avec succès' });
  } catch (err) { next(err); }
};

export const forcePasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.forcePasswordResetById(req.params.id as string);
    if (!user) { res.status(404).json({ error: 'Utilisateur non trouvé' }); return; }
    await log(req.user!.id, 'FORCE_PASSWORD_RESET', `Réinitialisation forcée du mot de passe de ${user.firstName} ${user.lastName}`, 'User', req.params.id as string);
    res.json({ message: 'Réinitialisation du mot de passe forcée avec succès' });
  } catch (err) { next(err); }
};