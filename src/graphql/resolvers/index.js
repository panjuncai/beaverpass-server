const userResolvers = require('./userResolvers');
const postResolvers = require('./postResolvers');
const chatResolvers = require('./chatResolvers');
const orderResolvers = require('./orderResolvers');
const { GraphQLScalarType, Kind } = require('graphql');

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
    ...postResolvers.Query,
    ...chatResolvers.Query,
    ...orderResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...orderResolvers.Mutation
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  ChatRoom: chatResolvers.ChatRoom,
  Message: chatResolvers.Message,
  MessageReadBy: chatResolvers.MessageReadBy,
  Order: orderResolvers.Order
};

module.exports = resolvers;