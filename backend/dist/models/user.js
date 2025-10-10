"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        field: 'user_id',
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('user', 'clinic', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    },
}, {
    tableName: 'users',
    sequelize: sequelize_2.default,
    underscored: false,
});
exports.default = User;
//# sourceMappingURL=user.js.map