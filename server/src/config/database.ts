import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

const sequelize = isDev
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
    })
  : new Sequelize(process.env.DATABASE_URL!, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    });

export default sequelize;
