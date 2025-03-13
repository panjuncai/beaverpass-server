import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 加载环境变量并进行基本检查
 * @returns {Object} 加载结果
 */
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
  
  // 基本环境变量检查
  performBasicChecks();
  
  return result;
};

/**
 * 执行基本的环境变量检查
 */
function performBasicChecks() {
  // 如果NODE_ENV未设置，默认设置为development
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('NODE_ENV 未设置，默认使用 development 环境');
  }
  
  // 检查数据库连接配置
  if (!process.env.DATABASE_URL) {
    console.warn('警告: DATABASE_URL 未设置，这可能导致数据库连接失败');
  }
  
  // 检查安全相关环境变量
  if (!process.env.SESSION_SECRET) {
    console.warn('警告: SESSION_SECRET 未设置，这可能导致会话安全问题');
  }
  
  // 系统默认使用Prisma ORM
  console.log('使用 Prisma ORM 进行数据库操作');
  
  // 检查AWS相关环境变量（如果需要使用S3存储）
  const awsVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME'];
  const missingAwsVars = awsVars.filter(varName => !process.env[varName]);
  
  if (missingAwsVars.length > 0 && missingAwsVars.length < awsVars.length) {
    console.warn(`警告: 部分AWS环境变量未设置: ${missingAwsVars.join(', ')}`);
    console.warn('这可能导致文件上传功能不可用');
  }
  
  // 生产环境特定检查
  if (process.env.NODE_ENV === 'production') {
    // 检查是否设置了错误跟踪服务
    if (!process.env.SENTRY_DSN) {
      console.warn('警告: 生产环境下建议设置 SENTRY_DSN 以进行错误跟踪');
    }
    
    // 检查是否使用了安全的会话密钥
    if (process.env.SESSION_SECRET && 
        (process.env.SESSION_SECRET.length < 32 || 
         process.env.SESSION_SECRET === 'your_session_secret_key')) {
      console.warn('警告: 生产环境下应使用强随机会话密钥');
    }
  }
}

export default loadEnv;
