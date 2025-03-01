const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/authMiddleware');

// 所有聊天相关的路由都需要登录
router.use(auth);

router.get('/rooms', auth, chatController.getChatRooms);

// 获取与特定用户的聊天室
router.get('/rooms/user/:userId', auth, chatController.getRoomWithUser);

// 获取特定聊天室的消息
router.get('/rooms/:roomId/messages', auth, chatController.getChatMessages);

// 发送消息
router.post('/rooms/:roomId/messages', auth, chatController.sendMessage);

// 创建聊天室
router.post('/rooms', auth, chatController.createChatRoom);

// 标记消息为已读
router.post('/rooms/:roomId/read', auth, chatController.markAsRead);

// 获取当前用户的未读消息总数
router.get('/rooms/unread', auth, chatController.getUnreadCount);

module.exports = router; 