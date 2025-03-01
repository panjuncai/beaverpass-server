const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const socketIO = require('../socket');  // 只引入模块，不立即获取实例

const getChatRooms = async (userId) => {
  try {
    const rooms = await ChatRoom.find({ 
      'participants._id': userId 
    })
    .populate('participants', 'firstName lastName avatar unreadCount')
    .populate({
      path: 'lastMessage',
      select: 'content createdAt senderId messageType postId'
    })
    .sort({ 'lastMessage.createdAt': -1 });
    // console.log(`rooms is ${JSON.stringify(rooms)}`)
    return rooms;
  } catch (error) {
    throw new Error(`Failed to get chat rooms: ${error.message}`);
  }
};

const getChatMessages = async (roomId, userId) => {
  try {
    // 验证用户是否在聊天室中
    const room = await ChatRoom.findOne({
      _id: roomId,
      'participants._id': userId
    });

    if (!room) {
      throw new Error('Chat room not found or access denied');
    }

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'firstName lastName avatar');

    // 标记消息为已读
    await Message.updateMany(
      {
        roomId,
        senderId: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    return messages;
  } catch (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }
};

const sendMessage = async (roomId, senderId, { content, postId, messageType = 'text' }) => {
  try {
    const room = await ChatRoom.findOne({
      _id: roomId,
      'participants._id': senderId
    });

    if (!room) {
      throw new Error('Chat room not found or access denied');
    }

    const messageData = {
      roomId,
      senderId,
      messageType,
      readBy: [senderId],
      createdAt: new Date()
    };

    if (messageType === 'post') {
      messageData.postId = postId;
    } else {
      messageData.content = content;
    }

    const message = await Message.create(messageData);
    
    // // 创建消息后通过Socket.IO发送到房间
    // const populatedMessage = await Message.findById(message._id)
    //   .populate('senderId', 'firstName lastName avatar');
    
    // // 在需要使用时获取 io 实例
    // const io = socketIO.getIO();
    // io.to(roomId).emit('new_message', populatedMessage);

    // 更新聊天室
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: message,
      $inc: {
        'participants.$[other].unreadCount': 1
      }
    }, {
      arrayFilters: [{ 'other._id': { $ne: senderId } }]
    });

    return message;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

const createChatRoom = async (buyerId, sellerId) => {
  try {
    // 检查是否已存在聊天室
    const existingRoom = await ChatRoom.findExistingRoom(buyerId, sellerId);
    
    if (existingRoom) {
      return existingRoom;
    }

    // 获取用户信息
    const [buyer, seller] = await Promise.all([
      User.findById(buyerId),
      User.findById(sellerId)
    ]);

    if (!seller) {
      throw new Error('Seller not found');
    }

    // 创建新聊天室
    const room = await ChatRoom.create({
      participants: [
        {
          _id: buyer._id,
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          avatar: buyer.avatar,
          unreadCount: 0
        },
        {
          _id: seller._id,
          firstName: seller.firstName,
          lastName: seller.lastName,
          avatar: seller.avatar,
          unreadCount: 0
        }
      ]
    });

    return room;
  } catch (error) {
    throw new Error(`Failed to create chat room: ${error.message}`);
  }
};

// 添加新方法：标记消息为已读
const markMessagesAsRead = async (roomId, userId) => {
  try {
    await ChatRoom.findOneAndUpdate(
      { 
        _id: roomId,
        'participants._id': userId 
      },
      {
        $set: { 'participants.$.unreadCount': 0 }
      }
    );

    // 标记该房间内所有未读消息为已读
    await Message.updateMany(
      {
        roomId,
        senderId: { $ne: userId },
        readBy: { $ne: userId }
      },
      {$addToSet: { readBy: userId }
    })

    // 在需要使用时获取 io 实例
    const io = socketIO.getIO();
    io.to(roomId).emit('messages_read', { roomId, userId });
    
  } catch (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

const findRoomWithUser = async (userId, sellerId) => {
  try {
    const room = await ChatRoom.findOne({
      'participants': {
        $all: [
          { $elemMatch: { '_id': userId } },
          { $elemMatch: { '_id': sellerId } }
        ]
      }
    })
    .populate('participants', 'firstName lastName avatar unreadCount')
    .populate({
      path: 'lastMessage',
      select: 'content createdAt senderId messageType postId'
    });

    return room;  // 如果没找到会返回 null
  } catch (error) {
    throw new Error(`Failed to find chat room: ${error.message}`);
  }
};

const getTotalUnreadCount = async (userId) => {
  try {
    // 查找用户参与的所有聊天室
    const rooms = await ChatRoom.find({ 
      'participants._id': userId 
    });
    
    // 计算总未读消息数
    let totalUnread = 0;
    
    for (const room of rooms) {
      // 找到当前用户在该聊天室中的记录
      const userParticipant = room.participants.find(
        p => p._id.toString() === userId.toString()
      );
      
      if (userParticipant && userParticipant.unreadCount) {
        totalUnread += userParticipant.unreadCount;
      }
    }
    
    return  totalUnread ;
  } catch (error) {
    throw new Error(`获取未读消息数失败: ${error.message}`);
  }
};

module.exports = {
  getChatRooms,
  getChatMessages,
  sendMessage,
  createChatRoom,
  markMessagesAsRead,
  findRoomWithUser,
  getTotalUnreadCount
}; 