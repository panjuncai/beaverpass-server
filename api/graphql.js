// api/graphql.js
import { ApolloServer } from 'apollo-server-micro';
import { PrismaClient } from '@prisma/client';
import typeDefs from '../src/graphql/typeDefs/index.js';
import resolvers from '../src/graphql/resolvers/index.js';
import { UserModel } from '../src/models/userModel.js';
import { PostModel } from '../src/models/postModel.js';
import { OrderModel } from '../src/models/orderModel.js';

// Supabase 验证相关
import { extractTokenFromRequest, verifySupabaseToken } from '../src/middleware/supabaseAuth.js';

// Prisma客户端实例
const prisma = new PrismaClient();

// Apollo Server 实例（简化）
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = extractTokenFromRequest(req);
    let user = null;

    if (token) {
      try {
        user = await verifySupabaseToken(token);
      } catch (error) {
        console.error('Auth Error:', error);
      }
    }

    return { prisma, user, models: { user: new UserModel(prisma), post: new PostModel(prisma), order: new OrderModel(prisma) } };
  },
});

// 初始化Apollo Server
const startServer = server.start();

// 处理请求的函数
export default async function handler(req, res) {
  // 记录请求信息
  console.log(`[${new Date().toISOString()}] 收到请求:`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
  });

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    console.log('处理 OPTIONS 请求');
    res.status(200).end();
    return;
  }

  try {
    // 确保服务器已启动
    await server.start();
    
    // 创建处理程序
    const apolloHandler = server.createHandler({ path: '/api/graphql' });
    
    // 调用 Apollo 处理程序
    return apolloHandler(req, res);
  } catch (error) {
    console.error('GraphQL 处理错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
