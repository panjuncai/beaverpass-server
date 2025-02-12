const mongoose = require("mongoose");

const productSnapshotSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
  },
  { _id: false }
); // 子文档，不需要 _id

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productSnapshot: {
      type: productSnapshotSchema,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending_payment", // 待支付
        "paid", // 已支付
        "shipped", // 已发货
        "completed", // 交易完成
        "canceled", // 取消
        "refunded", // 退款
      ],
      default: "pending_payment",
    },
    paymentInfo: {
      method: { type: String, default: "" }, // 如 'wechat_pay' / 'alipay' / 'card'等
      transactionId: { type: String, default: "" }, // 第三方支付流水号
    },
    shippingInfo: {
      address: { type: String, default: "" },
      receiver: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Order", orderSchema);
