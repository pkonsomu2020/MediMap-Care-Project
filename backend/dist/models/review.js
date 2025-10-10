"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
class Review extends sequelize_1.Model {
}
Review.init({
    id: {
        field: 'review_id',
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
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
    },
    comment: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'reviews',
    sequelize: sequelize_2.default,
});
exports.default = Review;
//# sourceMappingURL=review.js.map