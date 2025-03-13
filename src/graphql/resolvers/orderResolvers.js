const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to map database enum values to GraphQL enum values
const mapOrderStatusToGraphQL = (status) => {
  const mapping = {
    'pending_payment': 'PENDING_PAYMENT',
    'paid': 'PAID',
    'shipped': 'SHIPPED',
    'completed': 'COMPLETED',
    'canceled': 'CANCELED',
    'refunded': 'REFUNDED'
  };
  return mapping[status] || status;
};

// Helper function to map GraphQL enum values to database enum values
const mapOrderStatusToDB = (status) => {
  const mapping = {
    'PENDING_PAYMENT': 'pending_payment',
    'PAID': 'paid',
    'SHIPPED': 'shipped',
    'COMPLETED': 'completed',
    'CANCELED': 'canceled',
    'REFUNDED': 'refunded'
  };
  return mapping[status] || status;
};

// Format order for GraphQL response
const formatOrder = (order) => {
  if (!order) return null;
  
  return {
    ...order,
    status: mapOrderStatusToGraphQL(order.status),
    paymentFee: parseFloat(order.paymentFee || 0),
    deliveryFee: parseFloat(order.deliveryFee || 0),
    serviceFee: parseFloat(order.serviceFee || 0),
    tax: parseFloat(order.tax || 0),
    total: parseFloat(order.total)
  };
};

// Calculate order fees and total
const calculateOrderTotal = async (postId, deliveryFee = 0) => {
  const post = await prisma.post.findUnique({
    where: { id: postId }
  });
  
  if (!post) {
    throw new UserInputError('Post not found');
  }
  
  const amount = parseFloat(post.amount);
  const serviceFee = amount * 0.05; // 5% service fee
  const tax = amount * 0.08; // 8% tax
  const total = amount + deliveryFee + serviceFee + tax;
  
  return {
    amount,
    deliveryFee,
    serviceFee,
    tax,
    total
  };
};

const orderResolvers = {
  Query: {
    orders: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      
      const orders = await prisma.order.findMany({
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return orders.map(formatOrder);
    },
    
    order: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view an order');
      }
      
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // Check if user is the buyer or seller
      if (order.buyerId !== user.id && order.sellerId !== user.id) {
        throw new ForbiddenError('You can only view your own orders');
      }
      
      return formatOrder(order);
    },
    
    userOrders: async (_, { userId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      
      // Check if user is viewing their own orders or is an admin
      if (userId !== user.id) {
        throw new ForbiddenError('You can only view your own orders');
      }
      
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return orders.map(formatOrder);
    },
    
    buyerOrders: async (_, { buyerId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      
      // Check if user is viewing their own orders or is an admin
      if (buyerId !== user.id) {
        throw new ForbiddenError('You can only view your own orders');
      }
      
      const orders = await prisma.order.findMany({
        where: { buyerId },
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return orders.map(formatOrder);
    },
    
    sellerOrders: async (_, { sellerId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      
      // Check if user is viewing their own orders or is an admin
      if (sellerId !== user.id) {
        throw new ForbiddenError('You can only view your own orders');
      }
      
      const orders = await prisma.order.findMany({
        where: { sellerId },
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return orders.map(formatOrder);
    }
  },
  
  Mutation: {
    createOrder: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create an order');
      }
      
      const { postId, shippingAddress, shippingReceiver, shippingPhone, paymentMethod } = input;
      
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          poster: true,
          images: true
        }
      });
      
      if (!post) {
        throw new UserInputError('Post not found');
      }
      
      // Check if post is active
      if (post.status !== 'active') {
        throw new UserInputError('Post is not available for purchase');
      }
      
      // Check if user is not buying their own post
      if (post.posterId === user.id) {
        throw new ForbiddenError('You cannot buy your own post');
      }
      
      // Calculate order total
      const { deliveryFee, serviceFee, tax, total } = await calculateOrderTotal(postId);
      
      // Create order
      const order = await prisma.order.create({
        data: {
          buyerId: user.id,
          sellerId: post.posterId,
          postId,
          shippingAddress,
          shippingReceiver,
          shippingPhone,
          paymentMethod,
          paymentFee: 0, // Placeholder, to be updated after payment
          deliveryFee,
          serviceFee,
          tax,
          total,
          status: 'pending_payment'
        },
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return formatOrder(order);
    },
    
    updateOrder: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update an order');
      }
      
      const { id, status, paymentTransactionId } = input;
      
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!existingOrder) {
        throw new UserInputError('Order not found');
      }
      
      // Check if user is the seller (only sellers can update order status)
      if (existingOrder.sellerId !== user.id) {
        throw new ForbiddenError('Only the seller can update the order status');
      }
      
      // Prepare update data
      const updateData = {};
      
      if (status) {
        // Validate status transition
        const currentStatus = existingOrder.status;
        const newStatus = mapOrderStatusToDB(status);
        
        // Define allowed status transitions
        const allowedTransitions = {
          'pending_payment': ['paid', 'canceled'],
          'paid': ['shipped', 'refunded'],
          'shipped': ['completed', 'refunded'],
          'completed': [],
          'canceled': [],
          'refunded': []
        };
        
        if (!allowedTransitions[currentStatus].includes(newStatus)) {
          throw new UserInputError(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
        
        updateData.status = newStatus;
      }
      
      if (paymentTransactionId) {
        updateData.paymentTransactionId = paymentTransactionId;
      }
      
      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return formatOrder(updatedOrder);
    },
    
    cancelOrder: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to cancel an order');
      }
      
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!existingOrder) {
        throw new UserInputError('Order not found');
      }
      
      // Check if user is the buyer
      if (existingOrder.buyerId !== user.id) {
        throw new ForbiddenError('You can only cancel your own orders');
      }
      
      // Check if order can be canceled
      if (existingOrder.status !== 'pending_payment') {
        throw new ForbiddenError('You can only cancel orders that are pending payment');
      }
      
      // Update order status to canceled
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'canceled' },
        include: {
          buyer: true,
          seller: true,
          post: {
            include: {
              images: true
            }
          }
        }
      });
      
      return formatOrder(updatedOrder);
    }
  },
  
  Order: {
    buyer: async (order) => {
      if (order.buyer) return order.buyer;
      
      return prisma.user.findUnique({
        where: { id: order.buyerId }
      });
    },
    
    seller: async (order) => {
      if (order.seller) return order.seller;
      
      return prisma.user.findUnique({
        where: { id: order.sellerId }
      });
    },
    
    post: async (order) => {
      if (order.post) return order.post;
      
      const post = await prisma.post.findUnique({
        where: { id: order.postId },
        include: {
          images: true
        }
      });
      
      return post;
    }
  }
};

module.exports = orderResolvers; 