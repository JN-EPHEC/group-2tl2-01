import { Op } from 'sequelize';
import { Course, CourseType, User, Attendance, Member } from '../models';
import { consumeCredit, refundCreditById } from './creditService';

export const getAllCourses = async (filters: { from?: string; to?: string; courseTypeId?: string }) => {
  const where: any = {};
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date[Op.gte] = filters.from;
    if (filters.to)   where.date[Op.lte] = filters.to;
  }
  if (filters.courseTypeId) where.courseTypeId = filters.courseTypeId;

  const courses = await Course.findAll({
    where,
    include: [
      { model: CourseType, as: 'courseType' },
      { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
    ],
    order: [['date', 'DESC'], ['time', 'DESC']],
  });

  return Promise.all(courses.map(async (c) => {
    const attendanceCount = await Attendance.count({ where: { courseId: c.id } });
    return { ...c.toJSON(), attendanceCount };
  }));
};

export const createCourse = async (data: {
  date: string; time: string; courseTypeId: string; notes?: string; createdBy: string;
}) => {
  const course = await Course.create({
    date: data.date,
    time: data.time,
    courseTypeId: data.courseTypeId,
    createdBy: data.createdBy,
    notes: data.notes,
  });

  const courseType = await CourseType.findByPk(data.courseTypeId);
  return { course, courseTypeName: courseType?.name };
};

export const getCourseById = async (id: string) => {
  return Course.findByPk(id, {
    include: [
      { model: CourseType, as: 'courseType' },
      { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
      { model: Attendance, as: 'attendances', include: [{ model: Member, as: 'member' }] },
    ],
  });
};

export const updateCourseById = async (id: string, data: {
  date?: string; time?: string; courseTypeId?: string; notes?: string;
}) => {
  const course = await Course.findByPk(id);
  if (!course) return null;
  await course.update(data);
  return course;
};

export const addAttendancesToCourse = async (courseId: string, memberIds: string[]) => {
  const course = await Course.findByPk(courseId, { include: [{ model: CourseType, as: 'courseType' }] });
  if (!course) return null;

  const added: string[] = [];
  const alreadyPresent: string[] = [];
  const noCredits: string[] = [];

  for (const memberId of memberIds) {
    const existing = await Attendance.findOne({ where: { courseId, memberId } });
    if (existing) { alreadyPresent.push(memberId); continue; }

    const creditPurchaseId = await consumeCredit(memberId);
    if (!creditPurchaseId) noCredits.push(memberId);

    await Attendance.create({ courseId, memberId, creditPurchaseId });
    added.push(memberId);
  }

  return { added, alreadyPresent, noCredits, course };
};

export const removeAttendanceFromCourse = async (courseId: string, memberId: string) => {
  const attendance = await Attendance.findOne({ where: { courseId, memberId } });
  if (!attendance) return null;

  if (attendance.creditPurchaseId) await refundCreditById(attendance.creditPurchaseId);

  const member = await Member.findByPk(memberId);
  const course = await Course.findByPk(courseId);
  await attendance.destroy();

  return { member, course };
};