import orderService from "../services/orderService";

const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      buyerId: req.user.id
    };
    const order = await orderService.createOrder(orderData);
    res.status(200).json({ code: 0, msg: "Order created successfully", data: order });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrders(req.user.id, req.query);
    res.status(200).json({ code: 0, msg: "Orders fetched successfully", data: orders });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
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
      req.user.id
    );
    res.status(200).json({ code: 0, msg: "Order status updated successfully", data: order });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
}; 