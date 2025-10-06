import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface ReviewAttributes {
  id: number;
  patientId: number; // Foreign key to User
  clinicId: number; // Foreign key to Clinic
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public patientId!: number;
  public clinicId!: number;
  public rating!: number;
  public comment!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    clinicId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'clinics',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'reviews',
    sequelize,
  }
);

export default Review;
