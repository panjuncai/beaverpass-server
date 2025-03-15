import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { PrismaClient } from '@prisma/client';
import { verifySupabaseToken, extractTokenFromRequest } from '../src/middleware/supabaseAuth.js';
import supabase from '../src/config/supabase.js';
import typeDefs from '../src/graphql/typeDefs/index.js';
import resolvers from '../src/graphql/resolvers/index.js';
import { UserModel } from '../src/models/userModel.js';
import { PostModel } from '../src/models/postModel.js';
import { OrderModel } from '../src/models/orderModel.js';
import Cors from 'micro-cors';

// 初始化 Prisma 客户端
// 注意：在 Serverless 环境中，每个请求都会创建一个新的 Prisma 实例
// 这与传统服务器不同，传统服务器会重用同一个实例
const prisma = new PrismaClient();

// 创建模型实例
const models = {
  user: new UserModel(prisma),
  post: new PostModel(prisma),
  order: new OrderModel(prisma)
};

// 创建可执行的 schema
let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, ...typeDefs],
  resolvers
});

// 应用约束指令
schema = constraintDirective()(schema);

// 创建 Apollo Server 实例
const apolloServer = new ApolloServer({
  schema,
  context: async ({ req }) => {
    console.log('\n==================================================');
    console.log(`🚀 GraphQL 请求: ${req.body?.operationName || 'Anonymous Operation'}`);
    console.log('==================================================');
    
    if (req.body?.query) {
      console.log('📝 GraphQL 查询:');
      console.log(req.body.query);
    }
    
    if (req.body?.variables) {
      console.log('📝 GraphQL 变量:');
      console.log(JSON.stringify(req.body.variables, null, 2));
    }
    
    // 获取请求头中的 JWT 令牌
    console.log('🔍 检查 GraphQL 请求中的令牌...');
    const token = extractTokenFromRequest(req);
    
    let user = null;
    
    if (token) {
      try {
        // 验证 Supabase 令牌并获取用户信息
        console.log('🔍 验证 GraphQL 请求中的 Supabase 令牌...');
        user = await verifySupabaseToken(token);
        
        if (user) {
          console.log('✅ GraphQL 请求中的令牌验证成功');
        } else {
          console.log('⚠️ GraphQL 请求中的令牌无效');
        }
      } catch (error) {
        console.error('🚫 GraphQL 请求中的身份验证错误:', error);
      }
    } else {
      console.log('️⚠️ GraphQL 请求中未提供令牌，继续处理请求（未认证）');
    }
    
    return { 
      user, 
      prisma,
      supabase,
      models,
      // 添加一个函数来记录响应
      logResponse: (data) => {
        console.log('\n==================================================');
        console.log(`🚀 GraphQL 响应: ${req.body?.operationName || 'Anonymous Operation'}`);
        console.log('📝 响应数据:');
        console.log(JSON.stringify(data, null, 2));
        console.log('==================================================\n');
      }
    };
  },
  plugins: [
    {
      async requestDidStart(requestContext) {
        return {
          async willSendResponse(responseContext) {
            // 使用上下文中的 logResponse 函数记录响应
            if (responseContext.context.logResponse) {
              responseContext.context.logResponse(responseContext.response);
            }
          }
        };
      }
    }
  ]
});

// 启动 Apollo Server
const startServer = apolloServer.start();

// 设置 CORS
const cors = Cors({
  allowMethods: ['POST', 'OPTIONS', 'GET'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposeHeaders: ['Access-Control-Allow-Origin'],
  origin: ['https://beaverpass-client.vercel.app', 'https://www.bigclouder.com', 'https://bigclouder.com', 'http://localhost:5173'],
  allowCredentials: true,
  maxAge: 86400 // 24 hours in seconds
});

// 导出处理函数
export default cors(async (req, res) => {
  // 手动设置 CORS 头，确保它们被正确应用
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  await startServer;
  
  // 应用 Supabase 身份验证中间件
  // 注意：这里我们不能直接使用 Express 中间件，需要手动处理
  try {
    const token = extractTokenFromRequest(req);
    if (token) {
      const user = await verifySupabaseToken(token);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    console.error('身份验证错误:', error);
  }
  
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
});

// 配置 Vercel 特定的选项
export const config = {
  api: {
    bodyParser: false,
  },
}; 