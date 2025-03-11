/**
 * Prisma 客户端实例
 * 
 * 注意：在使用此模块之前，请确保：
 * 1. 已安装 @prisma/client 包
 * 2. 已运行 npx prisma generate 生成客户端
 * 3. 已配置正确的数据库连接 URL
 */

// 创建一个模拟的 Prisma 客户端，用于开发阶段
// 当您准备好使用真实的 Prisma 客户端时，取消下面的注释并删除模拟客户端
/*
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
*/

// 模拟的 Prisma 客户端，用于开发阶段
const prisma = {
  // 用户相关操作
  user: {
    findUnique: async () => ({}),
    findMany: async () => ([]),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0
  },
  // 帖子相关操作
  post: {
    findUnique: async () => ({}),
    findMany: async () => ([]),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0
  },
  // 订单相关操作
  order: {
    findUnique: async () => ({}),
    findMany: async () => ([]),
    findFirst: async () => ({}),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0
  }
};

export default prisma; 