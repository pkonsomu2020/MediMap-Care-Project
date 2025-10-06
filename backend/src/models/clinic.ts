import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface ClinicAttributes {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  specialty: string;
  description: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  availability: string;
  userId: number; // Foreign key to User
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClinicCreationAttributes extends Optional<ClinicAttributes, 'id'> {}

class Clinic extends Model<ClinicAttributes, ClinicCreationAttributes> implements ClinicAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public latitude!: number;
  public longitude!: number;
  public phone!: string;
  public email!: string;
  public specialty!: string;
  public description!: string;
  public rating!: number;
  public reviewCount!: number;
  public consultationFee!: number;
  public availability!: string;
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Clinic.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: new DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    phone: {
      type: new DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    specialty: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    reviewCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    availability: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'clinics',
    sequelize,
  }
);

export default Clinic;
