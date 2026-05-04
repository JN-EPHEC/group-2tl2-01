import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ActivityLogAttributes {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActivityLogCreationAttributes extends Optional<ActivityLogAttributes, 'id' | 'userId' | 'details' | 'targetType' | 'targetId'> {}

export class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  public id!: string;
  public userId!: string | null;
  public action!: string;
  public details!: string | null;
  public targetType!: string | null;
  public targetId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    modelName: 'ActivityLog',
  }
);

export default ActivityLog;
