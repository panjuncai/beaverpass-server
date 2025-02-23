const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: function() {
        return this.messageType !== "post";  // 只有非post类型消息才需要content
      }
    },
    postId: {  // 添加 post 字段
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: function() {
        return this.messageType === "post";  // 只有post类型消息才需要post
      }
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "post"],
      default: "text",
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Message", messageSchema);
