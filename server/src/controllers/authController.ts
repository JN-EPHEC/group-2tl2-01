import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Family } from '../models';
import { log } from '../services/activityLogService';

const JWT_SECRET = process.env.JWT_SECRET || 'club_secret_2024';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'club_refresh_secret_2024';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
  path: '/',
};

const buildPayload = (user: any) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  familyId: user.familyId,
});

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis' });
      return;
    }

    const user = await User.findOne({ where: { email, isActive: true } });

    if (!user) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }

    const payload = buildPayload(user);

    // Access token — courte durée (15 min)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    // Refresh token — longue durée (30 jours), stocké en Cookie HttpOnly
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '30d' });
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    await log(user.id, 'LOGIN', `Connexion de ${user.firstName} ${user.lastName}`, 'User', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        forcePasswordChange: user.forcePasswordChange,
        familyId: user.familyId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token manquant' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      res.status(401).json({ error: 'Refresh token invalide ou expiré' });
      return;
    }

    const user = await User.findOne({ where: { id: decoded.id, isActive: true } });
    if (!user) {
      res.status(401).json({ error: 'Utilisateur introuvable ou inactif' });
      return;
    }

    const payload = buildPayload(user);
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    // Rotation du refresh token
    const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '30d' });
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Déconnecté avec succès' });
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, forcePasswordChange: false });

    await log(userId, 'CHANGE_PASSWORD', `Changement de mot de passe par ${user.firstName} ${user.lastName}`, 'User', userId);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, currentPassword } = req.body;
    const userId = req.user!.id;

    if (!email || !currentPassword) {
      res.status(400).json({ error: 'Nouvel email et mot de passe actuel requis' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Adresse email invalide' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing && existing.id !== userId) {
      res.status(409).json({ error: 'Cet email est déjà utilisé' });
      return;
    }

    await user.update({ email });

    await log(userId, 'UPDATE_PROFILE', `Changement d'email par ${user.firstName} ${user.lastName}`, 'User', userId);

    res.json({ message: 'Email mis à jour avec succès' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    let familyData = null;
    if (user.role === 'family' && user.familyId) {
      familyData = await Family.findByPk(user.familyId);
    }

    res.json({ ...user.toJSON(), family: familyData });
  } catch (err) {
    next(err);
  }
};