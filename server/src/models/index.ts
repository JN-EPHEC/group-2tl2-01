import sequelize from '../config/database';
import { User } from './User';
import { Family } from './Family';
import { CourseType } from './CourseType';
import { Member } from './Member';
import { CreditPurchase } from './CreditPurchase';
import { Course } from './Course';

// User <-> Family associations
User.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });
Family.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

// Family <-> Member
Family.hasMany(Member, { foreignKey: 'familyId', as: 'members' });
Member.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

// Family <-> CreditPurchase
Family.hasMany(CreditPurchase, { foreignKey: 'familyId', as: 'creditPurchases' });
CreditPurchase.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

// Member <-> CreditPurchase (autonomous)
Member.hasMany(CreditPurchase, { foreignKey: 'memberId', as: 'creditPurchases' });
CreditPurchase.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// CreditPurchase <-> User (addedBy)
CreditPurchase.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });
User.hasMany(CreditPurchase, { foreignKey: 'addedBy', as: 'addedCredits' });

// CourseType <-> Course
CourseType.hasMany(Course, { foreignKey: 'courseTypeId', as: 'courses' });
Course.belongsTo(CourseType, { foreignKey: 'courseTypeId', as: 'courseType' });

// Course <-> User (createur)
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Course, { foreignKey: 'createdBy', as: 'createdCourses' });

export { sequelize, User, Family, CourseType, Member, CreditPurchase, Course };
