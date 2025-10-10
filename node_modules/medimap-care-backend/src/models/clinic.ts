import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface ClinicAttributes {
  id: number; // maps to clinic_id
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  services: string | null;
  consultationFee: number | null; // maps to consultation_fee
  contact: string | null;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClinicCreationAttributes extends Optional<ClinicAttributes, 'id' | 'address' | 'services' | 'consultationFee' | 'contact'> {}

class Clinic extends Model<ClinicAttributes, ClinicCreationAttributes> implements ClinicAttributes {
  public id!: number;
  public name!: string;
  public address!: string | null;
  public latitude!: number;
  public longitude!: number;
  public services!: string | null;
  public consultationFee!: number | null;
  public contact!: string | null;
  public rating!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Clinic.init(
  {
    id: {
      field: 'clinic_id',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    services: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consultationFee: {
      field: 'consultation_fee',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'clinics',
    sequelize,
  }
);

export default Clinic;
