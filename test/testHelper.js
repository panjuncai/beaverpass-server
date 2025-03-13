/**
 * 测试辅助函数
 * 
 * 此文件包含测试所需的通用辅助函数和设置
 */

import { PrismaClient } from '@prisma/client';
import loadEnv from '../src/config/env.js';

// 加载环境变量
loadEnv();

// 初始化Prisma客户端
const prisma = new PrismaClient();

/**
 * 初始化测试环境
 */
export function setupTestEnvironment() {
  console.log('初始化测试环境...');
  console.log('使用 Prisma ORM 进行数据库操作');
}

/**
 * 清理测试数据
 * @param {string} email - 测试用户的邮箱
 */
export async function cleanupTestData(email) {
  try {
    // 删除测试用户
    await prisma.user.deleteMany({
      where: {
        email
      }
    });
    console.log(`已清理测试用户: ${email}`);
  } catch (error) {
    console.error('清理测试数据失败:', error);
  }
}

export { prisma }; 