import { gql } from 'apollo-server-express';
import baseTypeDefs from './baseTypeDefs.js';
import authTypeDefs from './authTypeDefs.js';
import postTypeDefs from './postTypeDefs.js';
import uploadTypes from './uploadTypes.js';

// 基础类型定义，包含所有类型共享的基础类型
const baseTypeDefsGql = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

// 合并所有类型定义
const typeDefs = [
  baseTypeDefsGql,
  baseTypeDefs,
  authTypeDefs,
  postTypeDefs,
  uploadTypes
];

export default typeDefs; 