import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CourseTypeAttributes {
  id: string;
  name: string;
  isActive: boolean;
  color: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseTypeCreationAttributes extends Optional<CourseTypeAttributes, 'id' | 'isActive' | 'color'> {}

export class CourseType extends Model<CourseTypeAttributes, CourseTypeCreationAttributes> implements CourseTypeAttributes {
  public id!: string;
  public name!: string;
  public isActive!: boolean;
  public color!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CourseType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'course_types',
    modelName: 'CourseType',
  }
);

export default CourseType;