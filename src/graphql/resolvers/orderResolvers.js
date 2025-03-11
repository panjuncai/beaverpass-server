// import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';

// 创建 PubSub 实例用于订阅
// const pubsub = new PubSub();
const ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED';

// 辅助函数：构建分页查询
const buildPaginationQuery = (args) => {
  const { first, after, last, before, filter = {}, orderBy = {} } = args;
  
  // 构建过滤条件
  let where = {};
  
  if (filter.status) {
    where.status = filter.status;
  }
  
  if (filter.buyerId) {
    where.buyerId = filter.buyerId;
  }
  
  if (filter.sellerId) {
    where.sellerId = filter.sellerId;
  }
  
  if (filter.createdAfter || filter.createdBefore) {
    where.createdAt = {};
    
    if (filter.createdAfter) {
      where.createdAt.gte = new Date(filter.createdAfter);
    }
    
    if (filter.createdBefore) {
      where.createdAt.lte = new Date(filter.createdBefore);
    }
  }
  
  // 构建排序条件
  let orderByObj = {};
  
  if (orderBy.createdAt) {
    orderByObj.createdAt = orderBy.createdAt.toLowerCase();
  } else if (orderBy.updatedAt) {
    orderByObj.updatedAt = orderBy.updatedAt.toLowerCase();
  } else if (orderBy.total) {
    orderByObj.total = orderBy.total.toLowerCase();
  } else {
    // 默认按创建时间降序排序
    orderByObj.createdAt = 'desc';
  }
  
  // 构建游标分页
  let cursor = undefined;
  let skip = undefined;
  let take = undefined;
  
  if (first) {
    take = first;
    
    if (after) {
      cursor = { id: after };
      skip = 1; // 跳过游标所在的项
    }
  } else if (last) {
    take = -last; // 负数表示从末尾开始取
    
    if (before) {
      cursor = { id: before };
      skip = 1;
    }
  }
  
  return {
    where,
    orderBy: orderByObj,
    cursor,
    skip,
    take
  };
};

// 辅助函数：构建分页结果
const buildPaginationResult = async (prisma, model, args, items) => {
  const { first, last } = args;
  const count = await prisma[model].count({ where: args.where });
  
  // 构建边
  const edges = items.map(item => ({
    node: item,
    cursor: item.id
  }));
  
  // 构建分页信息
  const pageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
  };
  
  // 检查是否有下一页
  if (first && edges.length === first) {
    const nextItem = await prisma[model].findFirst({
      where: {
        ...args.where,
        id: { gt: pageInfo.endCursor }
      },
      orderBy: args.orderBy,
      take: 1
    });
    
    pageInfo.hasNextPage = !!nextItem;
  }
  
  // 检查是否有上一页
  if (last && edges.length === last) {
    const prevItem = await prisma[model].findFirst({
      where: {
        ...args.where,
        id: { lt: pageInfo.startCursor }
      },
      orderBy: args.orderBy,
      take: 1
    });
    
    pageInfo.hasPreviousPage = !!prevItem;
  }
  
  return {
    edges,
    pageInfo,
    totalCount: count
  };
};

// 订单解析器
const orderResolvers = {
  // 订单字段解析器
  Order: {
    // 解析买家信息
    buyer: async (parent, _, { prisma }) => {
      return prisma.user.findUnique({
        where: { id: parent.buyerId }
      });
    },
    
    // 解析卖家信息
    seller: async (parent, _, { prisma }) => {
      return prisma.user.findUnique({
        where: { id: parent.sellerId }
      });
    },
    
    // 解析帖子信息
    post: async (parent, _, { prisma }) => {
      return prisma.post.findUnique({
        where: { id: parent.postId }
      });
    }
  },
  
  // 查询解析器
  Query: {
    // 获取单个订单
    order: async (_, { id }, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to view an order');
      }
      
      // 查找订单
      const order = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!order) {
        return null;
      }
      
      // 检查用户是否有权限查看此订单（必须是买家或卖家）
      if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
        throw new ForbiddenError('You do not have permission to view this order');
      }
      
      return order;
    },
    
    // 获取订单列表（管理员功能）
    orders: async (_, args, { prisma, req }) => {
      // 检查用户是否是管理员
      if (!req.user || !req.user.isAdmin) {
        throw new ForbiddenError('Only administrators can view all orders');
      }
      
      // 构建查询
      const query = buildPaginationQuery(args);
      
      // 执行查询
      const items = await prisma.order.findMany(query);
      
      // 构建分页结果
      return buildPaginationResult(prisma, 'order', args, items);
    },
    
    // 获取我的买家订单
    myBuyerOrders: async (_, args, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to view your orders');
      }
      
      // 添加买家ID过滤条件
      const argsWithBuyer = {
        ...args,
        filter: {
          ...args.filter,
          buyerId: req.user.id
        }
      };
      
      // 构建查询
      const query = buildPaginationQuery(argsWithBuyer);
      
      // 执行查询
      const items = await prisma.order.findMany(query);
      
      // 构建分页结果
      return buildPaginationResult(prisma, 'order', argsWithBuyer, items);
    },
    
    // 获取我的卖家订单
    mySellerOrders: async (_, args, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to view your orders');
      }
      
      // 添加卖家ID过滤条件
      const argsWithSeller = {
        ...args,
        filter: {
          ...args.filter,
          sellerId: req.user.id
        }
      };
      
      // 构建查询
      const query = buildPaginationQuery(argsWithSeller);
      
      // 执行查询
      const items = await prisma.order.findMany(query);
      
      // 构建分页结果
      return buildPaginationResult(prisma, 'order', argsWithSeller, items);
    }
  },
  
  // 变更解析器
  Mutation: {
    // 创建订单
    createOrder: async (_, { input }, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to create an order');
      }
      
      const { sellerId, postId, shippingAddress, shippingReceiver, shippingPhone, paymentMethod } = input;
      
      // 验证卖家ID
      const seller = await prisma.user.findUnique({
        where: { id: sellerId }
      });
      
      if (!seller) {
        throw new UserInputError('Invalid seller ID');
      }
      
      // 验证帖子ID并获取帖子信息
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });
      
      if (!post) {
        throw new UserInputError('Invalid post ID');
      }
      
      // 检查帖子是否属于卖家
      if (post.userId !== sellerId) {
        throw new UserInputError('The post does not belong to the specified seller');
      }
      
      // 检查帖子是否可购买
      if (!post.isAvailable) {
        throw new UserInputError('This post is not available for purchase');
      }
      
      // 计算费用
      const deliveryFee = 0; // 可以根据实际情况计算
      const serviceFee = post.price * 0.05; // 服务费，假设为5%
      const tax = post.price * 0.08; // 税费，假设为8%
      const total = post.price + deliveryFee + serviceFee + tax;
      
      // 创建订单
      const order = await prisma.order.create({
        data: {
          // 用户关联
          buyerId: req.user.id,
          sellerId,
          
          // 商品快照
          postId,
          title: post.title,
          price: post.price,
          imageFront: post.imageFront,
          imageBack: post.imageBack,
          imageLeft: post.imageLeft,
          imageRight: post.imageRight,
          
          // 收货信息
          shippingAddress,
          shippingReceiver,
          shippingPhone,
          
          // 支付信息
          paymentMethod,
          
          // 金额计算相关
          deliveryFee,
          serviceFee,
          tax,
          total,
          
          // 订单状态默认为 PENDING_PAYMENT
        }
      });
      
      return order;
    },
    
    // 更新订单
    updateOrder: async (_, { id, input }, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to update an order');
      }
      
      // 查找订单
      const order = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // 检查用户是否有权限更新此订单
      const isAdmin = req.user.isAdmin;
      const isBuyer = order.buyerId === req.user.id;
      const isSeller = order.sellerId === req.user.id;
      
      if (!isAdmin && !isBuyer && !isSeller) {
        throw new ForbiddenError('You do not have permission to update this order');
      }
      
      // 根据用户角色限制可更新的字段
      let updateData = {};
      
      if (isAdmin) {
        // 管理员可以更新所有字段
        updateData = input;
      } else if (isBuyer) {
        // 买家只能更新收货信息和支付信息
        if (input.shippingAddress) updateData.shippingAddress = input.shippingAddress;
        if (input.shippingReceiver) updateData.shippingReceiver = input.shippingReceiver;
        if (input.shippingPhone) updateData.shippingPhone = input.shippingPhone;
        if (input.paymentTransactionId) updateData.paymentTransactionId = input.paymentTransactionId;
        
        // 买家只能将订单状态从 PENDING_PAYMENT 更新为 PAID
        if (input.status === 'PAID' && order.status === 'PENDING_PAYMENT') {
          updateData.status = input.status;
        }
      } else if (isSeller) {
        // 卖家只能将订单状态从 PAID 更新为 SHIPPED
        if (input.status === 'SHIPPED' && order.status === 'PAID') {
          updateData.status = input.status;
        }
      }
      
      // 更新订单
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData
      });
      
      // 如果状态发生变化，发布订阅事件
      if (input.status && input.status !== order.status) {
        // 暂时注释掉订阅发布
        // pubsub.publish(ORDER_STATUS_CHANGED, { orderStatusChanged: updatedOrder });
        console.log('Order status changed:', updatedOrder.status);
      }
      
      return updatedOrder;
    },
    
    // 取消订单
    cancelOrder: async (_, { id }, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to cancel an order');
      }
      
      // 查找订单
      const order = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // 检查用户是否有权限取消此订单
      const isAdmin = req.user.isAdmin;
      const isBuyer = order.buyerId === req.user.id;
      const isSeller = order.sellerId === req.user.id;
      
      if (!isAdmin && !isBuyer && !isSeller) {
        throw new ForbiddenError('You do not have permission to cancel this order');
      }
      
      // 检查订单状态是否可以取消
      if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PAID') {
        throw new UserInputError('This order cannot be canceled in its current status');
      }
      
      // 更新订单状态为已取消
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELED' }
      });
      
      // 发布订阅事件
      // 暂时注释掉订阅发布
      // pubsub.publish(ORDER_STATUS_CHANGED, { orderStatusChanged: updatedOrder });
      console.log('Order canceled:', updatedOrder.id);
      
      return updatedOrder;
    },
    
    // 完成订单
    completeOrder: async (_, { id }, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to complete an order');
      }
      
      // 查找订单
      const order = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // 检查用户是否是买家
      if (order.buyerId !== req.user.id && !req.user.isAdmin) {
        throw new ForbiddenError('Only the buyer or an admin can complete this order');
      }
      
      // 检查订单状态是否为已发货
      if (order.status !== 'SHIPPED') {
        throw new UserInputError('This order cannot be completed in its current status');
      }
      
      // 更新订单状态为已完成
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });
      
      // 发布订阅事件
      // 暂时注释掉订阅发布
      // pubsub.publish(ORDER_STATUS_CHANGED, { orderStatusChanged: updatedOrder });
      console.log('Order completed:', updatedOrder.id);
      
      return updatedOrder;
    },
    
    // 退款订单
    refundOrder: async (_, { id }, { prisma, req }) => {
      // 检查用户是否已登录
      if (!req.user) {
        throw new AuthenticationError('You must be logged in to refund an order');
      }
      
      // 检查用户是否是管理员
      if (!req.user.isAdmin) {
        throw new ForbiddenError('Only administrators can refund orders');
      }
      
      // 查找订单
      const order = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // 检查订单状态是否可以退款
      if (order.status !== 'PAID' && order.status !== 'SHIPPED') {
        throw new UserInputError('This order cannot be refunded in its current status');
      }
      
      // 更新订单状态为已退款
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'REFUNDED' }
      });
      
      // 发布订阅事件
      // 暂时注释掉订阅发布
      // pubsub.publish(ORDER_STATUS_CHANGED, { orderStatusChanged: updatedOrder });
      console.log('Order refunded:', updatedOrder.id);
      
      return updatedOrder;
    }
  },
  
  // 订阅解析器
  Subscription: {
    // 订单状态变更
    orderStatusChanged: {
      // 暂时返回一个空的异步迭代器
      subscribe: () => ({
        [Symbol.asyncIterator]: () => ({
          next: async () => ({ value: null, done: true }),
          return: () => ({ value: null, done: true }),
          throw: () => ({ value: null, done: true }),
        }),
      }),
      // 原始代码
      /*
      subscribe: (_, { id }, { req }) => {
        // 如果提供了订单ID，则只订阅该订单的状态变更
        if (id) {
          return pubsub.asyncIterator([`${ORDER_STATUS_CHANGED}_${id}`]);
        }
        
        // 否则订阅所有订单的状态变更
        return pubsub.asyncIterator([ORDER_STATUS_CHANGED]);
      }
      */
    }
  }
};

export default orderResolvers; 