import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MemberAttributes {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  birthDate: Date | null;
  weight: number | null;
  isActive: boolean;
  isAutonomous: boolean;
  familyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MemberCreationAttributes extends Optional<MemberAttributes, 'id' | 'photo' | 'birthDate' | 'weight' | 'isActive' | 'isAutonomous'> {}

export class Member extends Model<MemberAttributes, MemberCreationAttributes> implements MemberAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public photo!: string | null;
  public birthDate!: Date | null;
  public weight!: number | null;
  public isActive!: boolean;
  public isAutonomous!: boolean;
  public familyId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Member.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isAutonomous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    familyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'members',
    modelName: 'Member',
  }
);

export default Member;