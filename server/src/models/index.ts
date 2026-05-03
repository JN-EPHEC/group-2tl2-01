import sequelize from '../config/database';
import { User } from './User';
import { Family } from './Family';
import { CourseType } from './CourseType';

// User <-> Family associations
User.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });
Family.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

export { sequelize, User, Family, CourseType };
