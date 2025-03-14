import prisma from '../lib/prisma.js';

// Connect to PostgreSQL via Prisma
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('🚀 数据库通过 Prisma 连接成功');
    return prisma;
  } catch (error) {
    console.error('❌ 数据库连接错误:', error);
    throw error;
  }
}

// Export Prisma client for use in other modules
export { prisma };
