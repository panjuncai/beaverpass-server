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

// 完全开放跨域访问
const allowCors = fn => async (req, res) => {
  // 允许所有来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

const handler = allowCors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  await server.start();
  await server.createHandler({ path: '/api/graphql' })(req, res);
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
