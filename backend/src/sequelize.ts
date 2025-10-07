import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Prefer DATABASE_URL if provided; otherwise fall back to discrete env vars
// Ensure the password is always a string to satisfy pg's SCRAM auth
const dbName = process.env.DB_NAME || process.env.PGDATABASE || 'medimap';
const dbUser = process.env.DB_USER || process.env.PGUSER || 'postgres';
const dbPassword = `${process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? ''}`; // force string
const dbHost = process.env.DB_HOST || process.env.PGHOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.PGPORT || 5432);
const useSSL = (process.env.DB_SSL || '').toLowerCase() === 'true';

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: useSSL
        ? {
            ssl: { require: true, rejectUnauthorized: false },
          }
        : undefined,
    })
  : new Sequelize(dbName, dbUser, dbPassword, {
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

export default sequelize;
