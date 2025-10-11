import { Model, Optional } from 'sequelize';
interface AppointmentAttributes {
    id: number;
    userId: number;
    clinicId: number;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}
interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id' | 'status'> {
}
declare class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
    id: number;
    userId: number;
    clinicId: number;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Appointment;
//# sourceMappingURL=appointment.d.ts.map