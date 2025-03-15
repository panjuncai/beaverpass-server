/**
 * 用户信息更新示例
 * 
 * 这个示例展示了如何使用 Prisma 更新用户信息
 * 
 * 运行方式：
 * 1. 确保已设置环境变量 USE_PRISMA=true
 * 2. 执行 node examples/auth/update.js <用户ID>
 */

import { getUserById, updateUser } from '../../src/models/User.js';

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

async function updateUserInfo(userId, userData) {
  try {
    console.log(`正在更新用户 ID: ${userId}`);
    
    // 首先检查用户是否存在
    const { data: existingUser, error: getUserError } = await getUserById(userId);
    
    if (getUserError) {
      console.error('获取用户信息失败:', getUserError);
      return { success: false, message: getUserError.message };
    }
    
    if (!existingUser) {
      console.error('用户不存在');
      return { success: false, message: '用户不存在' };
    }
    
    console.log('当前用户信息:');
    console.log(JSON.stringify(existingUser, null, 2));
    
    // 更新用户信息
    const { data: updatedUser, error: updateError } = await updateUser(userId, userData);
    
    if (updateError) {
      console.error('更新用户信息失败:', updateError);
      return { success: false, message: updateError.message };
    }
    
    console.log('用户信息更新成功');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('更新过程中发生错误:', error);
    return { success: false, message: error.message };
  }
}

// 从命令行参数获取用户 ID
const userId = process.argv[2];

if (!userId) {
  console.error('请提供用户 ID');
  console.error('用法: node examples/auth/update.js <用户ID>');
  process.exit(1);
}

// 要更新的用户数据
const updateData = {
  firstName: 'Updated',
  lastName: 'User',
  avatar: 'https://example.com/avatar.jpg',
  address: '123 Main St, City, Country',
  phone: '+1234567890'
};

// 执行更新
updateUserInfo(userId, updateData)
  .then(result => {
    if (result.success) {
      console.log('更新后的用户信息:');
      console.log(JSON.stringify(result.user, null, 2));
    } else {
      console.log(`更新失败: ${result.message}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('执行更新时发生错误:', error);
    process.exit(1);
  }); 