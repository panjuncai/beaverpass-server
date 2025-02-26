const chatService = require('../services/chatService');

const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await chatService.getChatMessages(roomId, req.user._id);
    res.status(200).json({
      code: 0,
      msg: "Get messages successfully",
      data: messages
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, postId, messageType = 'text' } = req.body;
    
    const message = await chatService.sendMessage(roomId, req.user._id, {
      content,
      postId,
      messageType
    });

    res.status(200).json({
      code: 0,
      msg: "Message sent successfully",
      data: message
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
};

const createChatRoom = async (req, res) => {
  try {
    const {sellerId } = req.body;
    const room = await chatService.createChatRoom(req.user._id, sellerId);
    res.status(200).json({
      code: 0,
      msg: "Chat room created successfully",
      data: room
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    await chatService.markMessagesAsRead(roomId, req.user._id);
    res.status(200).json({
      code: 0,
      msg: "Messages marked as read successfully"
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
};

const getRoomWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const room = await chatService.findRoomWithUser(req.user._id, userId);
    
    res.status(200).json({
      code: 0,
      msg: "Get chat room successfully",
      data: room
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
  createChatRoom,
  markAsRead,
  getRoomWithUser
}; 