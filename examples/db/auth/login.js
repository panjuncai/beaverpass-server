/**
 * 用户登录示例
 * 
 * 这个示例展示了如何使用 Prisma 验证用户登录
 * 
 * 运行方式：
 * 1. 确保已设置环境变量 USE_PRISMA=true
 * 2. 执行 node examples/auth/login.js
 */

import { getUserByEmailWithPrisma } from '../../../src/models/User.js';
import bcrypt from 'bcryptjs';

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

// 模拟会话对象
const session = {
  user: null
};

async function loginUser(email, password) {
  try {
    debugger;
    console.log(`尝试登录用户: ${email}`);
    
    // 通过邮箱查找用户
    const { data: user, error } = await getUserByEmailWithPrisma(email);
    
    if (error) {
      console.error('查询用户失败:', error);
      return { success: false, message: error.message };
    }
    
    if (!user) {
      console.error('用户不存在');
      return { success: false, message: '用户不存在' };
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.error('密码不正确');
      return { success: false, message: '密码不正确' };
    }
    
    // 登录成功，存储用户信息到会话
    const { password: _, ...userWithoutPassword } = user;
    session.user = userWithoutPassword;
    
    console.log('登录成功');
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    return { success: false, message: error.message };
  }
}

// 执行登录
// 注意：请替换为实际存在的用户邮箱和密码
// 这里使用的邮箱和密码应该是通过 register.js 创建的用户
loginUser('qqxpp0001@126.com', '1')
  .then(result => {
    if (result.success) {
      console.log('用户已登录:');
      console.log(JSON.stringify(result.user, null, 2));
      console.log('\n会话信息:');
      console.log(JSON.stringify(session, null, 2));
    } else {
      console.log(`登录失败: ${result.message}`);
    }
  }); 