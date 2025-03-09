import dotenv from 'dotenv';

const loadEnv = () => {
  const result = dotenv.config({
    path: process.env.DOTENV_CONFIG_PATH || '.env'
  });
  
  if (result.error) {
    console.warn('Failed to load .env file, using environment variables');
  }
};

export default loadEnv;
