import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./typeDefs/index.js";
import resolvers from "./resolvers/index.js";

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

const server = new ApolloServer({
  schema: schemaWithConstraints,
  cors: false,
  context: ({ req, res }) => {
    return { req, res };
  },
});

export default server;
