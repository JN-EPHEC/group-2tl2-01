import bcrypt from 'bcrypt';
import { User } from '../models';

export const getAllUsers = async () => {
  return User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
};

export const createUser = async (data: {
  email: string; password: string; role: string;
  firstName: string; lastName: string; familyId?: string;
}) => {
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) throw { status: 409, message: 'Un utilisateur avec cet email existe déjà' };

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    email: data.email,
    password: hashedPassword,
    role: data.role as any,
    firstName: data.firstName,
    lastName: data.lastName,
    familyId: data.familyId || null,
  });

  const { password: _pw, ...userWithoutPassword } = user.toJSON() as unknown as Record<string, unknown>;
  return userWithoutPassword;
};

export const getUserById = async (id: string) => {
  return User.findByPk(id, { attributes: { exclude: ['password'] } });
};

export const updateUserById = async (id: string, data: {
  email?: string; firstName?: string; lastName?: string; role?: string; familyId?: string;
}, requestingUserId: string) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw { status: 409, message: 'Un utilisateur avec cet email existe déjà' };
  }

  await user.update({
    ...(data.email && { email: data.email }),
    ...(data.firstName && { firstName: data.firstName }),
    ...(data.lastName && { lastName: data.lastName }),
    ...(data.role && { role: data.role as any }),
    ...(data.familyId !== undefined && { familyId: data.familyId || null }),
  });

  const { password: _pw, ...userWithoutPassword } = user.toJSON() as unknown as Record<string, unknown>;
  return userWithoutPassword;
};

export const deactivateUserById = async (id: string, requestingUserId: string) => {
  if (id === requestingUserId) throw { status: 400, message: 'Impossible de désactiver votre propre compte' };
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ isActive: false });
  return user;
};

export const reactivateUserById = async (id: string) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ isActive: true });
  return user;
};

export const forcePasswordResetById = async (id: string) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ forcePasswordChange: true });
  return user;
};