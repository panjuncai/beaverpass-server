/**
 * GraphQL 用户登出测试
 * 
 * 使用方法：
 * 1. 确保已经运行过 registerTest.js 和 loginTest.js
 * 2. 运行命令: node logoutTest.js
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
        email
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

// 登出用户的 GraphQL 查询
const logoutMutation = `
  mutation Logout {
    logout {
      code
      msg
    }
  }
`;

// 检查会话状态的 GraphQL 查询
const checkSessionQuery = `
  query CheckSession {
    checkSession {
      code
      msg
      data {
        id
        email
      }
    }
  }
`;

// 执行登出请求
async function logoutUser() {
  try {
    // 先登录
    console.log('先登录用户以获取会话...');
    const loginResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: loginMutation,
        variables: loginVariables
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const loginResult = await loginResponse.json();
    if (!(loginResult.data && loginResult.data.login.code === 0)) {
      console.error('登录失败，无法继续登出操作');
      return;
    }
    
    console.log('登录成功，检查会话状态...');
    
    // 检查登录后的会话状态
    const sessionResponse1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: checkSessionQuery
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const sessionResult1 = await sessionResponse1.json();
    console.log('登录后会话状态:', JSON.stringify(sessionResult1, null, 2));
    
    // 执行登出
    console.log('开始登出...');
    const logoutResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: logoutMutation
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const logoutResult = await logoutResponse.json();
    console.log('登出结果:', JSON.stringify(logoutResult, null, 2));
    
    if (logoutResult.data && logoutResult.data.logout.code === 0) {
      console.log('登出成功！');
      
      // 检查登出后的会话状态
      console.log('检查登出后的会话状态...');
      const sessionResponse2 = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: checkSessionQuery
        }),
        credentials: 'include' // 包含 cookies 以支持会话
      });

      const sessionResult2 = await sessionResponse2.json();
      console.log('登出后会话状态:', JSON.stringify(sessionResult2, null, 2));
      
      if (sessionResult2.data && sessionResult2.data.checkSession.code !== 0) {
        console.log('会话已成功销毁');
      } else {
        console.log('警告: 会话可能未被正确销毁');
      }
    } else {
      console.error('登出失败:', logoutResult.data?.logout.msg || '未知错误');
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 执行登出
logoutUser(); 