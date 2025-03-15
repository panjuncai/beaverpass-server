import userResolvers from './userResolvers.js';
import chatResolvers from './chatResolvers.js';
import orderResolvers from './orderResolvers.js';
import postResolvers from './postResolvers.js';
import uploadResolvers from './uploadResolvers.js';
import { GraphQLScalarType, Kind } from 'graphql';

// Create custom DateTime scalar type
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date time scalar type, ISO-8601 format string',
  
  // Convert from GraphQL value to JavaScript Date object
  parseValue(value) {
    return new Date(value);
  },
  
  // Convert from AST to JavaScript Date object
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
  
  // Convert from JavaScript Date object to GraphQL value
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
  }
});

// Merge all resolvers
const resolvers = {
  // Custom scalar type resolver
  DateTime,
  
  Query: {
    ...userResolvers.Query,
    ...chatResolvers.Query,
    ...postResolvers.Query,
    ...orderResolvers.Query,
    ...uploadResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...postResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...uploadResolvers.Mutation
  }
};

export default resolvers;