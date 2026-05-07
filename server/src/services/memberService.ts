import { Member, Family, Attendance, Course, CourseType, CreditPurchase } from '../models';
import { computeFamilyBalance } from './creditService';

export const getAllMembers = async (includeInactive = false) => {
  const whereClause = includeInactive ? {} : { isActive: true };

  const members = await Member.findAll({
    where: whereClause,
    include: [{ model: Family, as: 'family', attributes: ['id', 'name'] }],
    order: [['lastName', 'ASC'], ['firstName', 'ASC']],
  });

  const uniqueFamilyIds = [...new Set(members.map(m => m.familyId))];
  const familyBalanceMap = new Map<string, number>();
  await Promise.all(uniqueFamilyIds.map(async fid => {
    familyBalanceMap.set(fid, await computeFamilyBalance(fid));
  }));

  return members.map(m => ({
    ...m.toJSON(),
    familyName: (m as any).family?.name ?? null,
    availableCredits: familyBalanceMap.get(m.familyId) ?? 0,
  }));
};

export const createMember = async (data: {
  firstName: string; lastName: string; familyId: string;
  birthDate?: string; weight?: number;
}) => {
  const family = await Family.findByPk(data.familyId);
  if (!family) throw { status: 404, message: 'Famille non trouvée' };

  const member = await Member.create({
    firstName: data.firstName,
    lastName: data.lastName,
    familyId: data.familyId,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    weight: data.weight || null,
  });

  return { member, familyName: family.name };
};

export const getMemberById = async (id: string) => {
  const member = await Member.findByPk(id, {
    include: [
      { model: Family, as: 'family', attributes: ['id', 'name'] },
      {
        model: Attendance, as: 'attendances', limit: 10, order: [['createdAt', 'DESC']],
        include: [{ model: Course, as: 'course', include: [{ model: CourseType, as: 'courseType', attributes: ['id', 'name', 'color'] }] }],
      },
    ],
  });

  if (!member) return null;

  const creditPurchases = await CreditPurchase.findAll({
    where: { familyId: member.familyId },
    order: [['purchaseDate', 'DESC']],
  });
  const availableCredits = await computeFamilyBalance(member.familyId);

  return { ...member.toJSON(), availableCredits, creditPurchases };
};

export const updateMemberById = async (id: string, data: {
  firstName?: string; lastName?: string; birthDate?: string;
  weight?: number | null; familyId?: string;
}) => {
  const member = await Member.findByPk(id);
  if (!member) return null;

  if (data.familyId) {
    const family = await Family.findByPk(data.familyId);
    if (!family) throw { status: 404, message: 'Famille non trouvée' };
  }

  await member.update({
    ...(data.firstName && { firstName: data.firstName }),
    ...(data.lastName && { lastName: data.lastName }),
    ...(data.birthDate !== undefined && { birthDate: data.birthDate ? new Date(data.birthDate) : null }),
    ...(data.weight !== undefined && { weight: data.weight || null }),
    ...(data.familyId && { familyId: data.familyId }),
  });

  return member;
};

export const deactivateMemberById = async (id: string) => {
  const member = await Member.findByPk(id);
  if (!member) return null;
  await member.update({ isActive: false });
  return member;
};

export const reactivateMemberById = async (id: string) => {
  const member = await Member.findByPk(id);
  if (!member) return null;
  await member.update({ isActive: true });
  return member;
};

export const updateMemberWeight = async (id: string, weight: number | null | undefined) => {
  const member = await Member.findByPk(id);
  if (!member) return null;
  await member.update({ weight: weight !== undefined ? (weight || null) : member.weight });
  return member;
};

export const getMemberAttendancesById = async (id: string) => {
  const member = await Member.findByPk(id);
  if (!member) return null;

  return Attendance.findAll({
    where: { memberId: id },
    include: [
      { model: Course, as: 'course', include: [{ model: CourseType, as: 'courseType', attributes: ['id', 'name', 'color'] }] },
      { model: CreditPurchase, as: 'creditPurchase', attributes: ['id', 'amount', 'purchaseDate'] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const changeMemberFamilyById = async (id: string, data: { familyId?: string }) => {
  const member = await Member.findByPk(id);
  if (!member) return null;

  if (data.familyId && data.familyId !== member.familyId) {
    const family = await Family.findByPk(data.familyId);
    if (!family) throw { status: 404, message: 'Famille non trouvée' };
  }

  if (data.familyId !== undefined) await member.update({ familyId: data.familyId });

  return member;
};