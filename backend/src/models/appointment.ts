import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface AppointmentAttributes {
  id: number; // maps to appointment_id
  userId: number; // maps to user_id
  clinicId: number; // maps to clinic_id
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id' | 'status'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: number;
  public userId!: number;
  public clinicId!: number;
  public date!: string;
  public time!: string;
  public status!: 'pending' | 'confirmed' | 'cancelled';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: {
      field: 'appointment_id',
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      allowNull: true,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'appointments',
    sequelize,
  }
);

export default Appointment;
