const Order = require("../models/Order");
const Post = require("../models/Post");

const createOrder = async (orderData) => {
  try {
    // 获取商品信息创建快照
    const post = await Post.findById(orderData.postSnapshot.postId);
    if (!post) {
      throw new Error("Post is not exists");
    }
    if (post.status !== "active") {
      throw new Error("Post is not available");
    }

    // 验证卖家不能购买自己的商品
    if (post.poster.toString() === orderData.buyerId.toString()) {
      throw new Error("Cannot buy your own post");
    }

    // 设置卖家ID
    orderData.sellerId = post.poster;

    // console.log('orderData:',orderData);
    // 创建订单
    const order = new Order(orderData);
    await order.save();

    // 更新商品状态为已售出
    post.status = "sold";
    await post.save();

    return order;
  } catch (e) {
    throw e;
  }
};

const getOrders = async (userId, filters) => {
  try {
    const { status, role = "buyer" } = filters;
    const query = {};

    // 根据角色筛选订单
    if (role === "buyer") {
      query.buyerId = userId;
    } else if (role === "seller") {
      query.sellerId = userId;
    }

    // 根据状态筛选
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("buyerId", "username")
      .populate("sellerId", "username");

    return orders;
  } catch (e) {
    throw e;
  }
};

const getOrderById = async (orderId, userId) => {
  try {
    const order = await Order.findById(orderId)
      .populate("buyerId", "username")
      .populate("sellerId", "username");

    if (!order) {
      throw new Error("Order is not exists");
    }

    // 验证用户是否有权限查看该订单
    if (
      order.buyerId._id.toString() !== userId.toString() &&
      order.sellerId._id.toString() !== userId.toString()
    ) {
      throw new Error("No permission to view the order");
    }

    return order;
  } catch (e) {
    throw e;
  }
};

const updateOrderStatus = async (orderId, status, userId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order is not exists");
    }

    // 验证用户是否有权限更新订单状态
    if (
      order.buyerId.toString() !== userId.toString() &&
      order.sellerId.toString() !== userId.toString()
    ) {
      throw new Error("No permission to update the order status");
    }

    // 验证订单状态流转是否合法
    const validStatusTransitions = {
      pending_payment: ["paid", "canceled"],
      paid: ["shipped", "refunded"],
      shipped: ["completed", "refunded"],
      completed: [],
      canceled: [],
      refunded: [],
    };

    if (!validStatusTransitions[order.status].includes(status)) {
      throw new Error("Invalid order status update");
    }

    order.status = status;
    await order.save();
    return order;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
}; 