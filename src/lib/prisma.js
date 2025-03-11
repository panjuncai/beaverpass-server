/**
 * Prisma 客户端实例
 * 
 * 注意：在使用此模块之前，请确保：
 * 1. 已安装 @prisma/client 包
 * 2. 已运行 npx prisma generate 生成客户端
 * 3. 已配置正确的数据库连接 URL
 */

import { PrismaClient } from '@prisma/client';

// 创建 Prisma 客户端实例
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// 添加中间件用于调试（可选）
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  console.log(`查询 ${params.model}.${params.action} 耗时: ${after - before}ms`);
  return result;
});

export default prisma; 