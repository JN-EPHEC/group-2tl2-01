import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { Family, Member, CreditPurchase, User, Attendance, Course, CourseType } from '../models';
import { computeFamilyBalance } from './creditService';

export const getAllFamilies = async () => {
  const families = await Family.findAll({
    where: { isActive: true },
    include: [{ model: CreditPurchase, as: 'creditPurchases', attributes: ['remaining'] }],
    order: [['name', 'ASC']],
  });

  return Promise.all(families.map(async (family) => {
    const familyJson = family.toJSON() as unknown as Record<string, unknown>;
    delete familyJson.creditPurchases;
    const totalCredits = await computeFamilyBalance(family.id);
    const memberCount = await Member.count({ where: { familyId: family.id, isActive: true } });
    return { ...familyJson, totalCredits, memberCount };
  }));
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
  const family = await Family.findByPk(id, {
    include: [
      { model: Member, as: 'members', where: { isActive: true }, required: false },
      {
        model: CreditPurchase, as: 'creditPurchases',
        include: [{ model: User, as: 'addedByUser', attributes: ['id', 'firstName', 'lastName'] }],
        order: [['purchaseDate', 'DESC']],
      },
    ],
  });

  if (!family) return null;

  const familyJson = family.toJSON() as unknown as Record<string, unknown>;
  (familyJson as any).creditHistory = familyJson.creditPurchases;
  delete familyJson.creditPurchases;
  const totalCredits = await computeFamilyBalance(id);

  return { ...familyJson, totalCredits };
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

export const updateFamilyContactById = async (id: string, data: { email?: string; phone?: string }) => {
  const family = await Family.findByPk(id);
  if (!family) return null;

  await family.update({
    ...(data.email !== undefined && { email: data.email || null }),
    ...(data.phone !== undefined && { phone: data.phone || null }),
  });

  return family;
};

export const addCreditsToFamily = async (id: string, amount: number, note: string | null, addedBy: string) => {
  const family = await Family.findByPk(id);
  if (!family) return null;

  const creditPurchase = await CreditPurchase.create({
    familyId: id,
    memberId: null,
    amount,
    remaining: amount,
    note: note || null,
    addedBy,
  });

  return { creditPurchase, familyName: family.name };
};

export const getFamilyAttendancesById = async (id: string) => {
  const family = await Family.findByPk(id);
  if (!family) return null;

  const familyMembers = await Member.findAll({
    where: { familyId: id },
    attributes: ['id', 'firstName', 'lastName'],
  });

  const memberIds = familyMembers.map((m) => m.id);
  if (memberIds.length === 0) return [];

  return Attendance.findAll({
    where: { memberId: { [Op.in]: memberIds } },
    include: [
      { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] },
      { model: Course, as: 'course', include: [{ model: CourseType, as: 'courseType', attributes: ['id', 'name', 'color'] }] },
    ],
    order: [['createdAt', 'DESC']],
  });
};