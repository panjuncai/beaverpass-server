import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { verifySupabaseToken, extractTokenFromRequest } from '../middleware/supabaseAuth.js';
import supabase from '../config/supabase.js';

import typeDefs from './typeDefs/index.js';
import resolvers from './resolvers/index.js';

import {UserModel} from '../models/userModel.js';
import {PostModel} from '../models/postModel.js';
import {OrderModel} from '../models/orderModel.js';
const prisma = new PrismaClient();

// Create executable schema
let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, ...typeDefs],
  resolvers
});

// Apply constraint directive
schema = constraintDirective()(schema);

const models={
  user:new UserModel(prisma),
  post:new PostModel(prisma),
  order:new OrderModel(prisma)
}

// Context function for HTTP requests
const context = async ({ req }) => {
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
  
  // 如果请求中已经有用户信息（通过中间件设置），则直接使用
  if (req.user) {
    console.log('👤 用户已通过中间件认证:', req.user.id);
    return { 
      user: req.user, 
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
  }
  
  // 获取请求头中的 JWT 令牌
  console.log('🔍 检查 GraphQL 请求中的令牌...');
  const token = extractTokenFromRequest(req);
  
  if (!token) {
    console.log('️⚠️ GraphQL 请求中未提供令牌，继续处理请求（未认证）');
    return { 
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
  }
  
  try {
    // 验证 Supabase 令牌并获取用户信息
    console.log('🔍 验证 GraphQL 请求中的 Supabase 令牌...');
    const user = await verifySupabaseToken(token);
    
    if (user) {
      console.log('✅ GraphQL 请求中的令牌验证成功');
    } else {
      console.log('⚠️ GraphQL 请求中的令牌无效');
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
  } catch (error) {
    console.error('🚫 GraphQL 请求中的身份验证错误:', error);
    return { 
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
  }
};

// Create Apollo Server
export const createApolloServer = () => {
  return new ApolloServer({
    schema,
    context,
    plugins: [
      // 添加插件来记录请求和响应
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
      },
      // Proper shutdown for the HTTP server
      {
        async serverWillStart() {
          return {
            async drainServer() {
              // Cleanup resources on server shutdown
            }
          };
        }
      }
    ]
  });
};
