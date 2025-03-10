import authResolvers from './authResolvers.js';
import postResolvers from './postResolvers.js';
import uploadResolvers from './uploadResolvers.js';

// 合并所有解析器
const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...postResolvers.Query,
    ...uploadResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...postResolvers.Mutation,
    ...uploadResolvers.Mutation
  }
};

export default resolvers;