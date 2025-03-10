import chatService from '../services/chatService';

const getChatRooms=async(req,res)=>{
  try {
    const rooms=await chatService.getChatRooms(req.user.id);
    res.status(200).json({
      code: 0,
      msg: "Get chat rooms successfully",
      data: rooms
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
}
const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await chatService.getChatMessages(roomId, req.user.id);
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
    
    const message = await chatService.sendMessage(roomId, req.user.id, {
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
    const room = await chatService.createChatRoom(req.user.id, sellerId);
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
    await chatService.markMessagesAsRead(roomId, req.user.id);
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
    const room = await chatService.findRoomWithUser(req.user.id, userId);
    
    res.status(200).json({
      code: 0,
      msg: "Get chat room successfully",
      data: room
    });
  } catch (error) {
    res.status(400).json({ code: 1, msg: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const result = await chatService.getTotalUnreadCount(req.user.id);
    res.status(200).json({
      code: 0,
      msg: "get unread count successfully",
      data: result
    });
  } catch (error) {
    res.status(200).json({ code: 1, msg: error.message });
  }
};

export {
  getChatRooms,
  getChatMessages,
  sendMessage,
  createChatRoom,
  markAsRead,
  getRoomWithUser,
  getUnreadCount
}; 