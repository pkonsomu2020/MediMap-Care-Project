import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/medimap', {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
