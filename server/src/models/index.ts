import sequelize from '../config/database';
import { User } from './User';
import { Family } from './Family';
import { Member } from './Member';
import { CreditPurchase } from './CreditPurchase';
import { CourseType } from './CourseType';
import { Course } from './Course';
import { Attendance } from './Attendance';
import { ActivityLog } from './ActivityLog';

// User <-> Family associations
User.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });
Family.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

// Family <-> Member
Family.hasMany(Member, { foreignKey: 'familyId', as: 'members' });
Member.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

// Family <-> CreditPurchase
Family.hasMany(CreditPurchase, { foreignKey: 'familyId', as: 'creditPurchases' });
CreditPurchase.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

// Member <-> Attendance
Member.hasMany(Attendance, { foreignKey: 'memberId', as: 'attendances' });
Attendance.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Member <-> CreditPurchase (autonomous)
Member.hasMany(CreditPurchase, { foreignKey: 'memberId', as: 'creditPurchases' });
CreditPurchase.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// CreditPurchase <-> User (addedBy)
CreditPurchase.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });
User.hasMany(CreditPurchase, { foreignKey: 'addedBy', as: 'addedCredits' });

// CourseType <-> Course
CourseType.hasMany(Course, { foreignKey: 'courseTypeId', as: 'courses' });
Course.belongsTo(CourseType, { foreignKey: 'courseTypeId', as: 'courseType' });

// Course <-> User (creator)
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Course, { foreignKey: 'createdBy', as: 'createdCourses' });

// Course <-> Attendance
Course.hasMany(Attendance, { foreignKey: 'courseId', as: 'attendances' });
Attendance.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Attendance <-> CreditPurchase
Attendance.belongsTo(CreditPurchase, { foreignKey: 'creditPurchaseId', as: 'creditPurchase' });
CreditPurchase.hasMany(Attendance, { foreignKey: 'creditPurchaseId', as: 'attendances' });

// ActivityLog <-> User
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });

export {
  sequelize,
  User,
  Family,
  Member,
  CreditPurchase,
  CourseType,
  Course,
  Attendance,
  ActivityLog,
};