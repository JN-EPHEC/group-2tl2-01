import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
export interface AttendanceAttributes {
  id: string;
  courseId: string;
  memberId: string;
  creditPurchaseId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'creditPurchaseId'> {}
export class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  public id!: string;
  public courseId!: string;
  public memberId!: string;
  public creditPurchaseId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    memberId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    creditPurchaseId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'attendances',
    modelName: 'Attendance',
    indexes: [
      {
        unique: true,
        fields: ['courseId', 'memberId'],
      },
    ],
  }
);

export default Attendance;



