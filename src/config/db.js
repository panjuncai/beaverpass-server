import supabase from './supabase.js';
import redis from 'redis';
import loadEnv from './env.js';
loadEnv();

// 检查是否使用 Prisma
const USE_PRISMA = process.env.USE_PRISMA === 'true';

const connectSupabase = async () => {
  // 如果使用 Prisma，则跳过 Supabase 连接测试
  if (USE_PRISMA) {
    console.log("使用 Prisma 模式，跳过 Supabase 连接测试");
    return;
  }
  
  try {
    // 测试 Supabase 连接
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log("Supabase 连接成功");
  } catch (e) {
    console.error("Supabase 连接错误:", e);
    process.exit(1);
  }
};

const redisClient = redis.createClient();
const connectRedis = async () => {
  // 初始化 redis 客户端
  redisClient.on("connect", () => console.log("Redis 连接成功"));
  redisClient.connect(); // v4 redis should connect
}

const connectDB = async () => {
  await connectSupabase();
  await connectRedis();
}

export {connectDB,redisClient};
