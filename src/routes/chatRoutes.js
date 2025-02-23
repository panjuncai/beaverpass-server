const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/authMiddleware');

// 所有聊天相关的路由都需要登录
router.use(auth);

// 获取聊天室列表
router.get('/rooms', chatController.getChatRooms);

// 获取与特定用户的聊天室
router.get('/rooms/user/:sellerId', chatController.getRoomWithUser);

// 获取特定聊天室的消息
router.get('/rooms/:roomId/messages', chatController.getChatMessages);

// 发送消息
router.post('/rooms/:roomId/messages', chatController.sendMessage);

// 创建聊天室
router.post('/rooms', chatController.createChatRoom);

// 标记消息为已读
router.post('/rooms/:roomId/read', chatController.markAsRead);

module.exports = router; 