const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const prisma = new PrismaClient();

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Context function for HTTP requests
const context = async ({ req }) => {
  // Get the token from the request headers
  const token = req.headers.authorization?.split(' ')[1] || '';
  
  if (!token) {
    return { prisma };
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    return { user, prisma };
  } catch (error) {
    return { prisma };
  }
};

// Create Apollo Server
const createApolloServer = () => {
  return new ApolloServer({
    schema,
    context,
    plugins: [
      // Proper shutdown for the HTTP server
      {
        async serverWillStart() {
          return {
            async drainServer() {
              // Cleanup resources on server shutdown
            }
          };
        }
      }
    ]
  });
};

module.exports = {
  createApolloServer
};
