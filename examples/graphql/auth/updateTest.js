/**
 * GraphQL 用户信息更新测试
 * 
 * 使用方法：
 * 1. 确保已经运行过 registerTest.js 和 loginTest.js
 * 2. 运行命令: node updateTest.js
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
const API_URL = process.env.API_URL || 'http://localhost:4000/graphql';

// 尝试加载用户测试信息
let userInfo;
try {
  const userInfoPath = path.join(__dirname, 'userTestInfo.json');
  if (fs.existsSync(userInfoPath)) {
    userInfo = JSON.parse(fs.readFileSync(userInfoPath, 'utf8'));
    console.log(`已加载用户测试信息: ${userInfo.email}`);
    
    if (!userInfo.userId) {
      console.error('错误: userTestInfo.json 中缺少用户 ID');
      console.log('请先运行 loginTest.js 获取用户 ID');
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

// 先登录用户以获取会话
const loginMutation = `
  mutation Login($input: LoginReq!) {
    login(input: $input) {
      code
      msg
      data {
        id
      }
    }
  }
`;

const loginVariables = {
  input: {
    email: userInfo.email,
    password: userInfo.password
  }
};

// 更新用户的 GraphQL 查询
const updateMutation = `
  mutation UpdateUser(
    $id: ID!
    $firstName: String
    $lastName: String
    $avatar: String
    $address: String
    $phone: String
  ) {
    updateUser(
      id: $id
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
      address: $address
      phone: $phone
    ) {
      code
      msg
      data {
        id
        email
        firstName
        lastName
        avatar
        address
        phone
        createdAt
        updatedAt
      }
    }
  }
`;

// 更新用户的数据
const updateVariables = {
  id: userInfo.userId,
  firstName: "Updated",
  lastName: "User",
  avatar: "https://example.com/avatar.jpg",
  address: "123 Main St, City, Country",
  phone: "+1234567890"
};

// 执行更新请求
async function updateUser() {
  try {
    // 先登录
    console.log('先登录用户以获取会话...');
    const loginResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: "Login",
        query: loginMutation,
        variables: loginVariables
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const loginResult = await loginResponse.json();
    if (!(loginResult.data && loginResult.data.login.code === 0)) {
      console.error('登录失败，无法继续更新操作');
      return;
    }
    
    console.log('登录成功，开始更新用户信息...');
    console.log(`正在向 ${API_URL} 发送更新请求...`);
    console.log(`更新用户 ID: ${updateVariables.id}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: "UpdateUser",
        query: updateMutation,
        variables: updateVariables
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const result = await response.json();
    console.log('更新结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.updateUser.code === 0) {
      console.log('更新成功！');
    } else {
      console.error('更新失败:', result.data?.updateUser.msg || '未知错误');
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 执行更新
updateUser(); 