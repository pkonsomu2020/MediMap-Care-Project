"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
class Clinic extends sequelize_1.Model {
}
Clinic.init({
    id: {
        field: 'clinic_id',
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    latitude: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    longitude: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    services: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    consultationFee: {
        field: 'consultation_fee',
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    contact: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: true,
    },
    rating: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'clinics',
    sequelize: sequelize_2.default,
});
exports.default = Clinic;
//# sourceMappingURL=clinic.js.map