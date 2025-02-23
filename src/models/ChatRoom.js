const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    lastName: String,
    avatar: String,
    unreadCount: { type: Number, default: 0 }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加静态方法来检查是否存在聊天室
chatRoomSchema.statics.findExistingRoom = async function(userId1, userId2) {
  return this.findOne({
    'participants': {
      $all: [
        { $elemMatch: { '_id': userId1 } },
        { $elemMatch: { '_id': userId2 } }
      ]
    }
  });
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema); 