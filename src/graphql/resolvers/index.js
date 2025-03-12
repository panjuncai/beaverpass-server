import authResolvers from './authResolvers.js';
import postResolvers from './postResolvers.js';
import uploadResolvers from './uploadResolvers.js';
import orderResolvers from './orderResolvers.js';
import { GraphQLScalarType, Kind } from 'graphql';

// 创建自定义 DateTime 标量类型
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: '日期时间标量类型,ISO-8601 格式的字符串',
  
  // 从 GraphQL 值转换为 JavaScript 日期对象
  parseValue(value) {
    return new Date(value);
  },
  
  // 从 AST 转换为 JavaScript 日期对象
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
  
  // 从 JavaScript 日期对象转换为 GraphQL 值
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
  }
});

// 合并所有解析器
const resolvers = {
  // 自定义标量类型解析器
  DateTime,
  
  Query: {
    ...authResolvers.Query,
    ...postResolvers.Query,
    ...uploadResolvers.Query,
    ...orderResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...postResolvers.Mutation,
    ...uploadResolvers.Mutation,
    ...orderResolvers.Mutation
  },
  Subscription: {
    ...orderResolvers.Subscription
  },
  // 添加订单字段解析器
  Order: orderResolvers.Order
};

export default resolvers;