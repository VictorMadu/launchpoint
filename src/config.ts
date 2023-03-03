import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const config = {
  db: {
    url: process.env.MONGO_URL as string,
  },
  port: process.env.PORT as string,
};
