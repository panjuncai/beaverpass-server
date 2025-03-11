import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createServer } from 'http';
// 暂时注释掉 WebSocket 相关导入
// import { WebSocketServer } from 'ws';
// import graphqlWs from 'graphql-ws';
import typeDefs from './typeDefs/index.js';
import resolvers from './resolvers/index.js';
// 重新启用 prisma 导入
import prisma from '../lib/prisma.js';

// 1. 组合 typeDefs (包括约束指令和我们的类型定义)
const combinedTypeDefs = [constraintDirectiveTypeDefs, ...typeDefs]; 

// 2. 组合 resolvers
const combinedResolvers = {
  ...resolvers
};

// 3. 创建基础 Schema 
const baseSchema = makeExecutableSchema({ typeDefs: combinedTypeDefs, resolvers: combinedResolvers }); 

// 4. 应用约束指令（使用 constraintDirective() 处理 Schema） 
const schemaWithConstraints = constraintDirective()(baseSchema);

// 设置订阅服务器
let httpServer;
// 暂时注释掉 WebSocket 相关变量
// let wsServer;
// let serverCleanup;

// 创建 Apollo Server 实例
const server = new ApolloServer({
  schema: schemaWithConstraints,
  context: ({ req, res }) => {
    // 将 req、res 和 prisma 对象传递给解析器
    return {
      req,
      res,
      // 重新启用 prisma
      prisma,
      // ... other context values ...
    };
  },
  plugins: [
    // 添加调试插件，记录所有请求和响应
    {
      async requestDidStart(requestContext) {
        console.log('请求开始:', {
          query: requestContext.request.query,
          variables: requestContext.request.variables,
          operationName: requestContext.request.operationName,
        });
        
        return {
          async willSendResponse(responseContext) {
            console.log('响应数据:', JSON.stringify(responseContext.response, null, 2));
          }
        };
      }
    },
    // 暂时注释掉订阅插件
    /*
    // 订阅插件
    {
      async serverWillStart() {
        return {
          async drainServer() {
            // 清理 WebSocket 服务器
            await serverCleanup?.dispose();
          }
        };
      }
    }
    */
  ],
  // formatError: (error) => {
  //   // 自定义错误格式
  //   console.error('GraphQL Error:', error);
  //   return {
  //     message: error.message,
  //     code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
  //     // 在生产环境中，可能需要隐藏详细的错误信息
  //     ...(process.env.NODE_ENV === 'development' && { stacktrace: error.extensions?.exception?.stacktrace })
  //   };
  // },
  cors: false,
});

// 导出函数用于在 Express 应用中设置 Apollo Server 和订阅
export const setupApolloServer = async (app) => {
  // 启动 Apollo Server
  await server.start();
  
  // 将 Apollo Server 中间件应用到 Express 应用
  server.applyMiddleware({ app, path: '/graphql' });
  
  // 创建 HTTP 服务器
  httpServer = createServer(app);
  
  // 暂时注释掉 WebSocket 服务器设置
  /*
  // 创建 WebSocket 服务器
  wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  
  // 设置 WebSocket 服务器
  serverCleanup = graphqlWs.useServer(
    {
      schema: schemaWithConstraints,
      context: (ctx) => {
        // 可以在这里处理认证
        return { prisma };
      },
    },
    wsServer
  );
  */
  
  return httpServer;
};

export default server;
