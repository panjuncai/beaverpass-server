import authResolvers from './authResolvers.js';
import postResolvers from './postResolvers.js';

// 合并所有解析器
const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...postResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...postResolvers.Mutation
  }
};

export default resolvers;