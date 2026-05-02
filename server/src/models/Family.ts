import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface FamilyAttributes {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  responsibleUserId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FamilyCreationAttributes extends Optional<FamilyAttributes, 'id' | 'phone' | 'email' | 'address' | 'isActive' | 'responsibleUserId'> {}

export class Family extends Model<FamilyAttributes, FamilyCreationAttributes> implements FamilyAttributes {
  public id!: string;
  public name!: string;
  public phone!: string | null;
  public email!: string | null;
  public address!: string | null;
  public isActive!: boolean;
  public responsibleUserId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Family.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    responsibleUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'families',
    modelName: 'Family',
  }
);

export default Family;