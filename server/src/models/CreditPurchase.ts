import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CreditPurchaseAttributes {
  id: string;
  familyId: string | null;
  memberId: string | null;
  amount: number;
  remaining: number;
  note: string | null;
  addedBy: string;
  purchaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreditPurchaseCreationAttributes extends Optional<CreditPurchaseAttributes, 'id' | 'familyId' | 'memberId' | 'note' | 'purchaseDate'> {}

export class CreditPurchase extends Model<CreditPurchaseAttributes, CreditPurchaseCreationAttributes> implements CreditPurchaseAttributes {
  public id!: string;
  public familyId!: string | null;
  public memberId!: string | null;
  public amount!: number;
  public remaining!: number;
  public note!: string | null;
  public addedBy!: string;
  public purchaseDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CreditPurchase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    familyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    memberId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'credit_purchases',
    modelName: 'CreditPurchase',
  }
);

export default CreditPurchase;