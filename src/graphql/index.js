import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from './typeDefs/index.js';
import resolvers from './resolvers/index.js';

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

// 创建 Apollo Server 实例
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    // 将 req 和 res 对象传递给解析器，以便访问会话和用户信息
    return {
      req,
      res,
      // ... other context values ...
    };
  },
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
  schema: schemaWithConstraints,
  cors: false,
});

export default server;
