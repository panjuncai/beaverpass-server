const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      // 如果需要单独做 Conversation 表，可以 ref: 'Conversation'
      // 否则这里留空或改成一个单独的标识
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 如果消息与商品或订单相关，也可增加以下字段
    // productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    // orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    content: { type: String, default: "" },
    messageType: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Message", messageSchema);
