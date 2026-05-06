import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { Family, Member, User } from '../models';

export const getAllFamilies = async () => {
  return Family.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']],
  });
};

export const createFamilyWithResponsible = async (data: {
  name: string; phone?: string; email?: string; address?: string;
  responsibleFirstName: string; responsibleLastName: string;
  responsibleEmail: string; responsiblePassword: string;
}) => {
  const existing = await User.findOne({ where: { email: data.responsibleEmail } });
  if (existing) throw { status: 409, message: 'Un utilisateur avec cet email existe déjà' };

  const family = await Family.create({
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
  });

  const hashedPassword = await bcrypt.hash(data.responsiblePassword, 10);
  const responsibleUser = await User.create({
    email: data.responsibleEmail,
    password: hashedPassword,
    role: 'family',
    firstName: data.responsibleFirstName,
    lastName: data.responsibleLastName,
    familyId: family.id,
  });

  await family.update({ responsibleUserId: responsibleUser.id });

  return {
    family,
    responsibleUser: {
      id: responsibleUser.id,
      email: responsibleUser.email,
      firstName: responsibleUser.firstName,
      lastName: responsibleUser.lastName,
    },
  };
};

export const getFamilyById = async (id: string) => {
  return Family.findByPk(id, {
    include: [
      { model: Member, as: 'members', where: { isActive: true }, required: false },
    ],
  });
};

export const updateFamilyById = async (id: string, data: {
  name?: string; phone?: string; email?: string; address?: string;
}) => {
  const family = await Family.findByPk(id);
  if (!family) return null;

  await family.update({
    ...(data.name && { name: data.name }),
    ...(data.phone !== undefined && { phone: data.phone || null }),
    ...(data.email !== undefined && { email: data.email || null }),
    ...(data.address !== undefined && { address: data.address || null }),
  });

  return family;
};

export const deactivateFamilyById = async (id: string) => {
  const family = await Family.findByPk(id);
  if (!family) return null;
  await family.update({ isActive: false });
  return family;
};