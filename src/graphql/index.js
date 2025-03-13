import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { verifySupabaseToken, extractTokenFromRequest } from '../middleware/supabaseAuth.js';
import supabase from '../config/supabase.js';

import typeDefs from './typeDefs/index.js';
import resolvers from './resolvers/index.js';

const prisma = new PrismaClient();

// Create executable schema
let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, ...typeDefs],
  resolvers
});

// Apply constraint directive
schema = constraintDirective()(schema);

// Context function for HTTP requests
const context = async ({ req }) => {
  // 获取请求头中的 JWT 令牌
  const token = extractTokenFromRequest(req);
  
  if (!token) {
    return { prisma, supabase };
  }
  
  try {
    // 验证 Supabase 令牌并获取用户信息
    const user = await verifySupabaseToken(token);
    
    return { user, prisma, supabase };
  } catch (error) {
    console.error('Authentication error:', error);
    return { prisma, supabase };
  }
};

// Create Apollo Server
export const createApolloServer = () => {
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
