import { AuthenticationError } from 'apollo-server-express';

const userResolvers = {
  Query: {
    // 获取当前登录用户信息
    me: async (_, __, { user, models }) => {
      console.log('👤 执行 me 查询');
      
      if (!user) {
        console.log('🚫 me 查询: 用户未登录');
        throw new AuthenticationError('Not logged in');
      }
      
      try {
        // 从数据库获取用户详细信息
        const dbUser = await models.user.getUserById(user.id);
        
        if (!dbUser) {
          console.log(`🚫 未找到用户: ID = ${user.id}`);
          throw new Error(`User not found in database: ${user.id}`);
        }
        
        console.log('✅ me 查询成功:', dbUser.id);
        return dbUser;
      } catch (error) {
        console.error(`🚫 获取用户失败: ${error.message}`);
        throw new Error(`Failed to get user information: ${error.message}`);
      }
    },
    
    // 根据 ID 获取用户信息
    user: async (_, { id }, { user, models }) => {
      console.log(`👤 执行 user 查询: ID = ${id}`);
      
      if (!user) {
        console.log('🚫 user 查询: 用户未登录');
        throw new AuthenticationError('You must be logged in to view user information');
      }
      
      try {
        console.log(`🔍 正在查询用户: ID = ${id}`);
        const dbUser = await models.user.getUserById(id); 
        
        if (!dbUser) {
          console.log(`🚫 未找到用户: ID = ${id}`);
          throw new Error(`User not found: ${id}`);
        }
        
        console.log(`✅ 成功获取用户: ID = ${id}`);
        return dbUser;
      } catch (error) {
        console.error(`🚫 获取用户失败: ${error.message}`);
        throw new Error(`Failed to get user information: ${error.message}`);
      }
    },
    
  },
  
  Mutation: {
    // 更新用户资料
    updateUser: async (_, { input }, { user, models }) => {
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
        const updateData = {
          id: user.id
        };
        
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (avatar) updateData.avatar = avatar;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        
        console.log('📝 更新字段:', JSON.stringify(updateData, null, 2));
        
        // 更新用户资料
        const dbUser = await models.user.updateUser(updateData);
        
        if (!dbUser) {
          throw new Error(`Failed to update user: ${error.message}`);
        }
        
        console.log('✅ 用户更新成功');
        
        return dbUser;
      } catch (error) {
        console.error(`🚫 更新用户失败: ${error.message}`);
        throw new Error(`Failed to update user: ${error.message}`);
      }
    },
  },
  
  User: {
    posts: async (user, _, { models }) => {
      console.log(`🔍 获取用户帖子: userID = ${user.id}`);
      try {
        const posts = await models.post.getPostsByPosterId(user.id);
        console.log(`✅ 成功获取用户帖子: count = ${posts.length}`);
        return posts;
      } catch (error) {
        console.error(`🚫 获取用户帖子失败: ${error.message}`);
        throw new Error(`Failed to get user posts: ${error.message}`);
      }
    },
    
    buyerOrders: async (user, _, { models }) => {
      console.log(`🔍 获取买家订单: userID = ${user.id}`);
      try {
        const orders = await models.order.getOrdersByBuyerId(user.id);
        console.log(`✅ 成功获取买家订单: count = ${orders.length}`);
        return orders;
      } catch (error) {
        console.error(`🚫 获取买家订单失败: ${error.message}`);
        return [];
      }
    },
    
    sellerOrders: async (user, _, { models }) => {
      console.log(`🔍 获取卖家订单: userID = ${user.id}`);
      try {
        const orders = await models.order.getOrdersBySellerId(user.id);
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