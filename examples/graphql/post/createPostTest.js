/**
 * GraphQL 帖子创建测试
 * 
 * 使用方法：
 * 1. 确保已经运行过 registerTest.js 和 loginTest.js
 * 2. 运行命令: node createPostTest.js
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

// 创建帖子的 GraphQL 查询
const createPostMutation = `
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      code
      msg
      data {
        id
        category
        title
        description
        condition
        images {
          FRONT
          SIDE
          BACK
          DAMAGE
        }
        price {
          amount
          isFree
          isNegotiable
        }
        deliveryType
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// 创建帖子的数据
const createPostVariables = {
  input: {
    category: "Living Room Furniture", // 使用带空格的字符串值
    title: "测试帖子标题",
    description: "这是一个测试帖子的描述，用于测试帖子创建功能。",
    condition: "Like New", // 使用带空格的字符串值
    images: {
      FRONT: "https://example.com/image1.jpg",
      SIDE: "https://example.com/image2.jpg",
      BACK: "https://example.com/image3.jpg",
      DAMAGE: null
    },
    price: {
      amount: "100.00",
      isFree: false,
      isNegotiable: true
    },
    deliveryType: "Both" // 使用带空格的字符串值
  }
};

// 执行创建帖子请求
async function createPost() {
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
      console.error('登录失败，无法继续创建帖子');
      return;
    }
    
    console.log('登录成功，开始创建帖子...');
    console.log(`正在向 ${API_URL} 发送创建帖子请求...`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: createPostMutation,
        variables: createPostVariables
      }),
      credentials: 'include' // 包含 cookies 以支持会话
    });

    const result = await response.json();
    console.log('创建帖子结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.createPost.code === 0) {
      console.log('创建帖子成功！');
      
      // 保存帖子信息到文件，以便后续测试使用
      const postInfo = {
        postId: result.data.createPost.data?.id,
        title: result.data.createPost.data?.title,
        category: result.data.createPost.data?.category
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'postTestInfo.json'), 
        JSON.stringify(postInfo, null, 2)
      );
      console.log('帖子信息已保存到 postTestInfo.json');
    } else {
      console.error('创建帖子失败:', result.data?.createPost.msg || result.errors?.[0]?.message || '未知错误');
    }
  } catch (error) {
    console.error('请求出错:', error.message);
  }
}

// 执行创建帖子
createPost(); 