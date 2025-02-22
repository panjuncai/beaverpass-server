const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

// 创建订单
router.post("/", auth, orderController.createOrder);

// 获取订单列表
router.get("/", auth, orderController.getOrders);

// 获取订单详情
router.get("/:id", auth, orderController.getOrderById);

// 更新订单状态
router.patch("/:id/status", auth, orderController.updateOrderStatus);

module.exports = router; 