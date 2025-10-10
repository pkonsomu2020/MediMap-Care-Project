"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
class Appointment extends sequelize_1.Model {
}
Appointment.init({
    id: {
        field: 'appointment_id',
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        field: 'user_id',
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
    },
    clinicId: {
        field: 'clinic_id',
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'clinics', key: 'clinic_id' },
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: true,
        defaultValue: 'pending',
    },
}, {
    tableName: 'appointments',
    sequelize: sequelize_2.default,
});
exports.default = Appointment;
//# sourceMappingURL=appointment.js.map