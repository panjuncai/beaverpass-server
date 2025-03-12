import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnv = () => {
  // 确定要加载的环境文件
  const envFile = process.env.DOTENV_CONFIG_PATH || 
                 (process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env');
  
  console.log(`尝试加载环境变量文件: ${envFile}`);
  
  // 尝试加载指定的环境文件
  const result = dotenv.config({
    path: envFile
  });
  
  // 如果指定的环境文件加载失败，尝试加载默认的.env文件
  if (result.error) {
    console.warn(`无法加载 ${envFile} 文件: ${result.error.message}`);
    console.log('尝试加载默认的 .env 文件...');
    
    const defaultResult = dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });
    
    if (defaultResult.error) {
      console.warn(`无法加载默认的 .env 文件: ${defaultResult.error.message}`);
      console.warn('将使用系统环境变量');
    } else {
      console.log('成功加载默认的 .env 文件');
    }
  } else {
    console.log(`成功加载 ${envFile} 文件`);
  }
  
  // 如果NODE_ENV未设置，默认设置为development
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('NODE_ENV 未设置，默认使用 development 环境');
  }
  
  // 检查Supabase相关环境变量
  if (process.env.USE_PRISMA === 'true') {
    console.log('使用Prisma模式，Supabase相关环境变量将不是必需的');
  } else {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.warn('警告: Supabase相关环境变量(SUPABASE_URL, SUPABASE_KEY)未设置，这可能导致应用程序崩溃');
      console.warn('如果您想使用Prisma而不是Supabase，请设置 USE_PRISMA=true');
    }
  }
};

export default loadEnv;
