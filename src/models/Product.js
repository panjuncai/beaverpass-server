const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    // 如果希望只存 categoryId：
    // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    // 或者在这里做一个简单对象存储分类信息
    category: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      name: String,
    },
    tags: [{ type: String }],
    price: { type: Number },
    condition: {
      type: String,
      enum: [
        "Like New",
        "Gently Used",
        "Minor Scratches",
        "Stains",
        "Needs Repair",
      ],
      required: true,
    },
    images: [{ type: String }], // 存储图片URL
    status: {
      type: String,
      enum: ["active", "sold", "removed"],
      default: "active",
    },
    deliveryOptions: [
      { type: String, enum: ["Home Delivery", "Pick Up"] },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Product", productSchema);
