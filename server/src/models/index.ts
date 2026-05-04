import sequelize from '../config/database';
import { User } from './User';
import { Family } from './Family';
import { CourseType } from './CourseType';
import { Member } from './Member';


// User <-> Family associations
User.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });
Family.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

// Family <-> Member
Family.hasMany(Member, { foreignKey: 'familyId', as: 'members' });
Member.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

export { sequelize, User, Family, CourseType, Member };




