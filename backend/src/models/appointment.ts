import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface AppointmentAttributes {
  id: number;
  patientId: number; // Foreign key to User
  clinicId: number; // Foreign key to Clinic
  appointmentDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: number;
  public patientId!: number;
  public clinicId!: number;
  public appointmentDate!: Date;
  public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public notes!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
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
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'appointments',
    sequelize,
  }
);

export default Appointment;
