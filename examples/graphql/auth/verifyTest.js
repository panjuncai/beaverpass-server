/**
 * GraphQL 用户邮箱验证测试
 * 
 * 使用方法：
 * 1. 确保已经运行过 registerTest.js 并生成了 userTestInfo.json
 * 2. 手动将验证令牌添加到 userTestInfo.json 文件中
 * 3. 运行命令: node verifyTest.js
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试加载项目根目录的 .env 文件
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envPath)) {
  console.log(`加载 .env 文件: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('未找到 .env 文件，使用环境变量');
}

// 确保设置了 USE_PRISMA 环境变量
if (!process.env.USE_PRISMA) {
  process.env.USE_PRISMA = 'true';
  console.log('已设置 USE_PRISMA=true');
}

// GraphQL 服务器地址
const API_URL = process.env.API_URL || 'http://localhost:4000/graphql';

// 尝试加载用户测试信息
let userInfo;
try {
  const userInfoPath = path.join(__dirname, 'userTestInfo.json');
  if (fs.existsSync(userInfoPath)) {
    userInfo = JSON.parse(fs.readFileSync(userInfoPath, 'utf8'));
    console.log(`已加载用户测试信息: ${userInfo.email}`);
    
    if (!userInfo.verificationToken) {
      console.error('错误: userTestInfo.json 中缺少验证令牌');
      console.log('请手动添加验证令牌到 userTestInfo.json 文件中');
      console.log('您可以从注册邮件中获取验证令牌，或者从数据库中查询');
      process.exit(1);
    }
  } else {
    throw new Error('未找到用户测试信息文件');
  }
} catch (error) {
  console.error('加载用户测试信息失败:', error.message);
  console.log('请先运行 registerTest.js 创建测试用户');
  process.exit(1);
}

// 验证用户的 GraphQL 查询
const verifyMutation = `
  mutation VerifyUser($verificationToken: String!) {
    verifyUser(verificationToken: $verificationToken) {
      code
      msg
      data {
        id
        email
        firstName
        lastName
        isVerified
        createdAt
        updatedAt
      }
    }
  }
`;

// 验证用户的数据
const verifyVariables = {
  verificationToken: userInfo.verificationToken
};

// 执行验证请求
async function verifyUser() {
  try {
    console.log(`正在向 ${API_URL} 发送验证请求...`);
    console.log(`验证令牌: ${verifyVariables.verificationToken}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: verifyMutation,
        variables: verifyVariables
      })
    });

    const result = await response.json();
    console.log('验证结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.verifyUser.code === 0) {
      console.log('验证成功！');
      
      // 更新用户信息
      userInfo.isVerified = true;
      fs.writeFileSync(
        path.join(__dirname, 'userTestInfo.json'), 
        JSON.stringify(userInfo, null, 2)
      );
      console.log('用户信息已更新');
    } else {
      console.error('验证失败:', result.data?.verifyUser.msg || '未知错误');
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 执行验证
verifyUser(); 