import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface ReviewAttributes {
  id: number; // maps to review_id
  userId: number; // maps to user_id
  clinicId: number; // maps to clinic_id
  rating: number;
  comment: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'comment'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public userId!: number;
  public clinicId!: number;
  public rating!: number;
  public comment!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      field: 'review_id',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'user_id' },
    },
    clinicId: {
      field: 'clinic_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'clinics', key: 'clinic_id' },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'reviews',
    sequelize,
  }
);

export default Review;
