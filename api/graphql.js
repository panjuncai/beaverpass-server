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

// 设置允许的来源
const corsOptions = {
  origin: 'https://beaverpass-client.vercel.app',
  methods: ['POST', 'OPTIONS'],
  credentials: true,
};

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://beaverpass-client.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

const handler = server.createHandler({ path: '/api/graphql' });

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  await server.start();
  await handler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
