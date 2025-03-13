/**
 * 用户注册示例
 * 
 * 这个示例展示了如何使用 Prisma 创建新用户
 * 
 * 运行方式：
 * 1. 执行 node test/db/auth/register.js
 */

import { createUserWithPrisma } from '../../src/models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

async function registerUser() {
  try {
    // 用户数据
    const email = `qqxpp0001@126.com`;
    const password = '1';
    const firstName = 'Jerry';
    const lastName = 'Pan';
    
    // 生成哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 生成验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // 准备用户数据
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verificationToken,
      isVerified: false
    };
    
    console.log('正在创建用户...');
    
    // 创建用户
    const { data: user, error } = await createUserWithPrisma(userData);
    
    if (error) {
      console.error('创建用户失败:', error);
      return;
    }
    
    console.log('用户创建成功:');
    console.log(JSON.stringify(user, null, 2));
    
    console.log(`\n验证链接: ${process.env.BASE_URI}/verifyEmail?token=${verificationToken}`);
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行注册
registerUser(); 