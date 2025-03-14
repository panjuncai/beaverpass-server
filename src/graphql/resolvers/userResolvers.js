import { AuthenticationError } from 'apollo-server-express';
import prisma from '../../lib/prisma.js';


const userResolvers = {
  Query: {
    // 获取当前登录用户信息
    me: async (_, __, { user }) => {
      console.log('👤 执行 me 查询');
      
      if (!user) {
        console.log('🚫 me 查询: 用户未登录');
        throw new AuthenticationError('Not logged in');
      }
      
      console.log('✅ me 查询成功:', user.id);
      return user;
    },
    
    // 根据 ID 获取用户信息
    user: async (_, { id }, { user, prisma }) => {
      console.log(`👤 执行 user 查询: ID = ${id}`);
      
      if (!user) {
        console.log('🚫 user 查询: 用户未登录');
        throw new AuthenticationError('You must be logged in to view user information');
      }
      
      try {
        console.log(`🔍 正在查询用户: ID = ${id}`);
        const data = await prisma.user.findUnique({
          where: { id: id }
        });
        
        if (!data) {
          console.log(`🚫 未找到用户: ID = ${id}`);
          throw new Error(`User not found: ${id}`);
        }
        
        console.log(`✅ 成功获取用户: ID = ${id}`);
        return data;
      } catch (error) {
        console.error(`🚫 获取用户失败: ${error.message}`);
        throw new Error(`Failed to get user information: ${error.message}`);
      }
    },
    
  },
  
  Mutation: {
    // 更新用户资料
    updateUser: async (_, { input }, { user, prisma }) => {
      console.log('👤 执行 updateUser 变更');
      console.log('📝 更新数据:', JSON.stringify(input, null, 2));
      
      if (!user) {
        console.log('🚫 updateUser: 用户未登录');
        throw new AuthenticationError('You must be logged in to update your information');
      }
      
      const { firstName, lastName, avatar, address, phone } = input;
      
      try {
        console.log(`🔍 正在更新用户: ID = ${user.id}`);
        
        // 准备更新数据
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (avatar) updateData.avatar = avatar;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        
        console.log('📝 更新字段:', JSON.stringify(updateData, null, 2));
        
        // 更新用户资料
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
        
        console.log('✅ 用户更新成功');
        
        return {
          code: 200,
          success: true,
          message: 'User information updated successfully',
          user: updatedUser
        };
      } catch (error) {
        console.error(`🚫 更新用户失败: ${error.message}`);
        return {
          code: 500,
          success: false,
          message: `Failed to update: ${error.message}`,
          user: null
        };
      }
    },
  },
  
  User: {
    posts: async (user) => {
      console.log(`🔍 获取用户帖子: userID = ${user.id}`);
      try {
        const posts = await prisma.post.findMany({
          where: { posterId: user.id },
          include: {
            images: true
          }
        });
        console.log(`✅ 成功获取用户帖子: count = ${posts.length}`);
        return posts;
      } catch (error) {
        console.error(`🚫 获取用户帖子失败: ${error.message}`);
        return [];
      }
    },
    
    buyerOrders: async (user) => {
      console.log(`🔍 获取买家订单: userID = ${user.id}`);
      try {
        const orders = await prisma.order.findMany({
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
        console.log(`✅ 成功获取买家订单: count = ${orders.length}`);
        return orders;
      } catch (error) {
        console.error(`🚫 获取买家订单失败: ${error.message}`);
        return [];
      }
    },
    
    sellerOrders: async (user) => {
      console.log(`🔍 获取卖家订单: userID = ${user.id}`);
      try {
        const orders = await prisma.order.findMany({
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
        console.log(`✅ 成功获取卖家订单: count = ${orders.length}`);
        return orders;
      } catch (error) {
        console.error(`🚫 获取卖家订单失败: ${error.message}`);
        return [];
      }
    }
  }
};

export default userResolvers; 