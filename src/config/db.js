import { createClient } from 'redis';
import prisma from '../lib/prisma.js';
import loadEnv from './env.js';
loadEnv();



// Connect to Redis
export async function connectRedis() {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = createClient({
      url: redisUrl
    });

    client.on('error', (err) => {
      console.error('Redis 客户端错误:', err);
    });

    await client.connect();
    console.log('✅ Redis 连接成功');
    return client;
  } catch (error) {
    console.error('❌ Redis 连接错误:', error);
    throw error;
  }
}

// Connect to PostgreSQL via Prisma
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库通过 Prisma 连接成功');
    return prisma;
  } catch (error) {
    console.error('❌ 数据库连接错误:', error);
    throw error;
  }
}

// Export Prisma client for use in other modules
export { prisma };
