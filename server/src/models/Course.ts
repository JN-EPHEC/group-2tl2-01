import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
export interface CourseAttributes {
  id: string;
  date: string;
  time: string;
  courseTypeId: string;
  createdBy: string;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'notes'> {}
export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: string;
  public date!: string;
  public time!: string;
  public courseTypeId!: string;
  public createdBy!: string;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'courses',
    modelName: 'Course',
  }
);
export default Course;

