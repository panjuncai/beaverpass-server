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

// 枚举值映射
const categoryMap = {
  "Living Room Furniture": "Living_Room_Furniture",
  "Bedroom Furniture": "Bedroom_Furniture",
  "Dining Room Furniture": "Dining_Room_Furniture",
  "Office Furniture": "Office_Furniture",
  "Outdoor Furniture": "Outdoor_Furniture",
  "Storage": "Storage",
  "Other": "Other"
};

const conditionMap = {
  "Like New": "Like_New",
  "Gently Used": "Gently_Used",
  "Minor Scratches": "Minor_Scratches",
  "Stains": "Stains",
  "Needs Repair": "Needs_Repair"
};

const deliveryTypeMap = {
  "Home Delivery": "Home_Delivery",
  "Pickup": "Pickup",
  "Both": "Both"
};

// 枚举解析器
const enumResolvers = {
  PostCategory: {
    // 将枚举值转换为前端可读的字符串
    Living_Room_Furniture: "Living Room Furniture",
    Bedroom_Furniture: "Bedroom Furniture",
    Dining_Room_Furniture: "Dining Room Furniture",
    Office_Furniture: "Office Furniture",
    Outdoor_Furniture: "Outdoor Furniture",
    Storage: "Storage",
    Other: "Other"
  },
  PostCondition: {
    Like_New: "Like New",
    Gently_Used: "Gently Used",
    Minor_Scratches: "Minor Scratches",
    Stains: "Stains",
    Needs_Repair: "Needs Repair"
  },
  DeliveryType: {
    Home_Delivery: "Home Delivery",
    Pickup: "Pickup",
    Both: "Both"
  }
};

// 合并所有解析器
const resolvers = {
  // 自定义标量类型解析器
  DateTime,
  
  // 添加枚举解析器
  ...enumResolvers,
  
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

// 导出解析器和映射
export default resolvers;
export { categoryMap, conditionMap, deliveryTypeMap };