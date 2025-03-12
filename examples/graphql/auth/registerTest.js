/**
 * GraphQL 用户注册测试
 * 
 * 使用方法：
 * 1. 确保设置了环境变量 USE_PRISMA=true
 * 2. 运行命令: node registerTest.js
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

// 注册用户的 GraphQL 查询
const registerMutation = `
  mutation Register($input: RegisterReq!) {
    register(input: $input) {
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

// 注册用户的数据
const registerVariables = {
  input: {
    email: "qqxpp0001@126.com",
    password: "1",
    confirmPassword: "1",
    firstName: "Test",
    lastName: "User"
  }
};

// 执行注册请求
async function registerUser() {
  try {
    console.log(`正在向 ${API_URL} 发送注册请求...`);
    console.log(`注册邮箱: ${registerVariables.input.email}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: "Register",
        query: registerMutation,
        variables: registerVariables
      }),
    });

    const result = await response.json();
    console.log('注册结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.register.code === 0) {
      console.log('注册成功！');
      // 保存用户信息到文件，以便后续测试使用
      const userInfo = {
        email: registerVariables.input.email,
        password: registerVariables.input.password,
        userId: result.data.register.data?.id,
        verificationToken: null // 验证令牌通常会通过邮件发送
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'userTestInfo.json'), 
        JSON.stringify(userInfo, null, 2)
      );
      console.log('用户信息已保存到 userTestInfo.json');
    } else {
      console.error('注册失败:', result.data?.register.msg || '未知错误');
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 执行注册
registerUser(); 