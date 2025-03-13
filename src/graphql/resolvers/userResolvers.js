import { AuthenticationError, UserInputError } from 'apollo-server-express';
import prisma from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper function to generate a JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const userResolvers = {
  Query: {
    // 获取当前登录用户信息
    me: async (_, __, { user, supabase }) => {
      if (!user) {
        throw new AuthenticationError('未登录');
      }
      
      return user;
    },
    
    // 根据 ID 获取用户信息
    user: async (_, { id }, { user, supabase }) => {
      if (!user) {
        throw new AuthenticationError('您必须登录才能查看用户资料');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw new Error(`获取用户信息失败: ${error.message}`);
      }
      
      return data;
    },
    
    // 获取所有用户（可能需要管理员权限）
    users: async (_, __, { user, supabase }) => {
      if (!user) {
        throw new AuthenticationError('您必须登录才能查看用户列表');
      }
      
      // 检查是否为管理员（可选）
      // if (!user.is_admin) {
      //   throw new AuthenticationError('只有管理员可以查看所有用户');
      // }
      
      const { data, error } = await supabase
        .from('users')
        .select('*');
        
      if (error) {
        throw new Error(`获取用户列表失败: ${error.message}`);
      }
      
      return data;
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
    
    // 更新用户资料
    updateUser: async (_, { input }, { user, supabase }) => {
      if (!user) {
        throw new AuthenticationError('您必须登录才能更新个人资料');
      }
      
      const { firstName, lastName, avatar, address, phone } = input;
      
      try {
        // 更新用户资料
        const { data, error } = await supabase
          .from('users')
          .update({
            ...(firstName && { first_name: firstName }),
            ...(lastName && { last_name: lastName }),
            ...(avatar && { avatar_url: avatar }),
            ...(address && { address }),
            ...(phone && { phone })
          })
          .eq('id', user.id)
          .select()
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        return {
          code: 200,
          success: true,
          message: '用户资料更新成功',
          user: data
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: `更新失败: ${error.message}`,
          user: null
        };
      }
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

export default userResolvers; 