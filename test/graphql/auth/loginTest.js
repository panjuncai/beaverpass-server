/**
 * GraphQL 用户登录测试
 * 
 * 使用方法：
 * 1. 确保已经运行过 registerTest.js 并生成了 userTestInfo.json
 * 2. 运行命令: node loginTest.js
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
const rootDir = path.resolve(__dirname, '../../../');
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
const API_URL = process.env.API_URL || 'http://localhost:4001/graphql';

// 尝试加载用户测试信息
let userInfo;
try {
  const userInfoPath = path.join(__dirname, 'userTestInfo.json');
  if (fs.existsSync(userInfoPath)) {
    userInfo = JSON.parse(fs.readFileSync(userInfoPath, 'utf8'));
    console.log(`已加载用户测试信息: ${userInfo.email}`);
  } else {
    throw new Error('未找到用户测试信息文件');
  }
} catch (error) {
  console.error('加载用户测试信息失败:', error.message);
  console.log('请先运行 registerTest.js 创建测试用户');
  process.exit(1);
}

// 登录用户的 GraphQL 查询
const loginMutation = `
  mutation Login($input: LoginReq!) {
    login(input: $input) {
      code
      msg
      data {
        id
        email
        firstName
        lastName
        createdAt
        updatedAt
      }
    }
  }
`;

// 登录用户的数据
const loginVariables = {
  input: {
    email: userInfo.email,
    password: userInfo.password
  }
};

// 执行登录请求
async function loginUser() {
  try {
    console.log(`正在向 ${API_URL} 发送登录请求...`);
    console.log(`登录邮箱: ${loginVariables.input.email}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'Login',
        query: loginMutation,
        variables: loginVariables
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const result = await response.json();
    console.log('登录结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.login.code === 0) {
      console.log('登录成功！');
      
      // 更新用户信息
      userInfo.userId = result.data.login.data?.id;
      fs.writeFileSync(
        path.join(__dirname, 'userTestInfo.json'), 
        JSON.stringify(userInfo, null, 2)
      );
      console.log('用户信息已更新');
      
      // 检查会话状态
      await checkSession();
    } else {
      console.error('登录失败:', result.data?.login.msg || '未知错误');
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 检查会话状态的 GraphQL 查询
const checkSessionQuery = `
  query CheckSession {
    checkSession {
      code
      msg
      data {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

// 检查会话状态
async function checkSession() {
  try {
    console.log('正在检查会话状态...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: checkSessionQuery
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const result = await response.json();
    console.log('会话状态:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.checkSession.code === 0) {
      console.log('会话有效，用户已登录');
    } else {
      console.log('会话无效或用户未登录');
    }
  } catch (error) {
    console.error('检查会话状态出错:', error.message);
  }
}

// 执行登录
loginUser(); 