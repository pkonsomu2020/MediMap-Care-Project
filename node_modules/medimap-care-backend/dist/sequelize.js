"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
const dbName = process.env.DB_NAME || process.env.PGDATABASE || 'medimap';
const dbUser = process.env.DB_USER || process.env.PGUSER || 'postgres';
const dbPassword = `${process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? ''}`;
const dbHost = process.env.DB_HOST || process.env.PGHOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.PGPORT || 5432);
const useSSL = (process.env.DB_SSL || '').toLowerCase() === 'true';
const sequelize = databaseUrl
    ? new sequelize_1.Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: useSSL
            ? {
                ssl: { require: true, rejectUnauthorized: false },
            }
            : undefined,
    })
    : new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: false,
        dialectOptions: useSSL
            ? {
                ssl: { require: true, rejectUnauthorized: false },
            }
            : undefined,
    });
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map