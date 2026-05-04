import sequelize from '../config/database';
import { User } from './User';
import { Family } from './Family';
import { CourseType } from './CourseType';
import { Member } from './Member';
import { CreditPurchase } from './CreditPurchase';

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

export { sequelize, User, Family, CourseType, Member, CreditPurchase };
