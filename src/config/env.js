const dotenv = require('dotenv');

const loadEnv = () => {
  const env = process.env.NODE_ENV || "development";

  dotenv.config({ path: `.env.${env}.local` });
  dotenv.config({ path: `.env.${env}` });
  dotenv.config();
};

module.exports = loadEnv;
