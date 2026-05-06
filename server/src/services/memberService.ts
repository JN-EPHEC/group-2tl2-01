import { Member, Family, Attendance, Course, CourseType } from '../models';

export const getAllMembers = async (includeInactive = false) => {
  const whereClause = includeInactive ? {} : { isActive: true };

  return Member.findAll({
    where: whereClause,
    include: [{ model: Family, as: 'family', attributes: ['id', 'name'] }],
    order: [['lastName', 'ASC'], ['firstName', 'ASC']],
  });
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
  return Member.findByPk(id, {
    include: [
      { model: Family, as: 'family', attributes: ['id', 'name'] },
      {
        model: Attendance, as: 'attendances', limit: 10, order: [['createdAt', 'DESC']],
        include: [{ model: Course, as: 'course', include: [{ model: CourseType, as: 'courseType', attributes: ['id', 'name', 'color'] }] }],
      },
    ],
  });
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