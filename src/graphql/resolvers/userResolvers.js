const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Helper function to generate a JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

const userResolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        return null;
      }
      
      return prisma.user.findUnique({
        where: { id: user.id }
      });
    },
    
    user: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view user profiles');
      }
      
      return prisma.user.findUnique({
        where: { id }
      });
    },
    
    users: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view users');
      }
      
      return prisma.user.findMany();
    }
  },
  
  Mutation: {
    register: async (_, { input }) => {
      const { email, password, firstName, lastName, phone } = input;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        throw new UserInputError('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(20).toString('hex');
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          isVerified: false,
          verificationToken
        }
      });
      
      // TODO: Send verification email
      console.log(`Verification token for ${email}: ${verificationToken}`);
      
      // Generate JWT token
      const token = generateToken(user);
      
      return {
        token,
        user
      };
    },
    
    login: async (_, { input }) => {
      const { email, password } = input;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        throw new UserInputError('Invalid email or password');
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UserInputError('Invalid email or password');
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      return {
        token,
        user
      };
    },
    
    updateUser: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update your profile');
      }
      
      const { firstName, lastName, avatar, address, phone } = input;
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(avatar && { avatar }),
          ...(address && { address }),
          ...(phone && { phone })
        }
      });
      
      return updatedUser;
    },
    
    changePassword: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to change your password');
      }
      
      const { currentPassword, newPassword } = input;
      
      // Find user
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      // Check current password
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      
      if (!isPasswordValid) {
        throw new UserInputError('Current password is incorrect');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword
        }
      });
      
      return true;
    },
    
    verifyEmail: async (_, { token }) => {
      // Find user with verification token
      const user = await prisma.user.findFirst({
        where: { verificationToken: token }
      });
      
      if (!user) {
        throw new UserInputError('Invalid verification token');
      }
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null
        }
      });
      
      return true;
    },
    
    requestPasswordReset: async (_, { email }) => {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        // Don't reveal that the user doesn't exist
        return true;
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: resetToken
        }
      });
      
      // TODO: Send reset email
      console.log(`Reset token for ${email}: ${resetToken}`);
      
      return true;
    },
    
    resetPassword: async (_, { token, newPassword }) => {
      // Find user with reset token
      const user = await prisma.user.findFirst({
        where: { verificationToken: token }
      });
      
      if (!user) {
        throw new UserInputError('Invalid reset token');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          verificationToken: null
        }
      });
      
      return true;
    }
  },
  
  User: {
    posts: async (user) => {
      return prisma.post.findMany({
        where: { posterId: user.id },
        include: {
          images: true
        }
      });
    },
    
    buyerOrders: async (user) => {
      return prisma.order.findMany({
        where: { buyerId: user.id },
        include: {
          post: {
            include: {
              images: true
            }
          },
          seller: true
        }
      });
    },
    
    sellerOrders: async (user) => {
      return prisma.order.findMany({
        where: { sellerId: user.id },
        include: {
          post: {
            include: {
              images: true
            }
          },
          buyer: true
        }
      });
    }
  }
};

module.exports = userResolvers; 