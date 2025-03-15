/**
 * 用户验证示例
 * 
 * 这个示例展示了如何使用 Prisma 验证用户邮箱
 * 
 * 运行方式：
 * 1. 确保已设置环境变量 USE_PRISMA=true
 * 2. 执行 node examples/auth/verify.js <验证令牌>
 */

import { verifyUser, updateUser } from '../../../src/models/userModel.js';

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

async function verifyUserEmail(token) {
  try {
    console.log(`正在验证令牌: ${token}`);
    
    // 查找具有指定验证令牌的用户
    const { data: user, error: verifyError } = await verifyUser(token);
    
    if (verifyError) {
      console.error('验证过程中发生错误:', verifyError);
      return { success: false, message: verifyError.message };
    }
    
    if (!user) {
      console.error('无效的验证令牌');
      return { success: false, message: '无效的验证令牌' };
    }
    
    // 如果用户已经验证过，则返回成功
    if (user.isVerified) {
      console.log('用户已经验证过');
      return { success: true, message: '用户已经验证过', user };
    }
    
    // 更新用户为已验证状态
    const { data: updatedUser, error: updateError } = await updateUser(user.id, {
      isVerified: true
    });
    
    if (updateError) {
      console.error('更新用户状态失败:', updateError);
      return { success: false, message: updateError.message };
    }
    
    console.log('用户验证成功');
    return { success: true, message: '用户验证成功', user: updatedUser };
  } catch (error) {
    console.error('验证过程中发生错误:', error);
    return { success: false, message: error.message };
  }
}

// 从命令行参数获取验证令牌
const token = process.argv[2];

if (!token) {
  console.error('请提供验证令牌');
  console.error('用法: node examples/auth/verify.js <验证令牌>');
  process.exit(1);
}

// 执行验证
verifyUserEmail(token)
  .then(result => {
    if (result.success) {
      console.log(`验证成功: ${result.message}`);
      console.log('用户信息:');
      console.log(JSON.stringify(result.user, null, 2));
    } else {
      console.log(`验证失败: ${result.message}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('执行验证时发生错误:', error);
    process.exit(1);
  }); 