import sequelize from '../config/database';
import { User } from './User';
import { Family } from './Family';


User.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });
Family.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

export { sequelize, User, Family };
