const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      buyerId: req.user._id
    };
    const order = await orderService.createOrder(orderData);
    res.status(200).json({ code: 0, msg: "Order created successfully", data: order });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrders(req.user._id, req.query);
    res.status(200).json({ code: 0, msg: "Orders fetched successfully", data: orders });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id);
    res.status(200).json({ code: 0, msg: "Order details fetched successfully", data: order });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );
    res.status(200).json({ code: 0, msg: "Order status updated successfully", data: order });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
}; 