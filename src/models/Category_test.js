// saveCategories.js
const mongoose = require("mongoose");
const Category = require("./Category");

// 连接你的 MongoDB 数据库
mongoose.connect("mongodb://127.0.0.1:27017/beaverpass", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createCategories() {
  try {
    // 第一个分类（顶级分类）
    const category1 = await Category.create({
      name: "Living Room Furniture",
      orderId: 1,
    });

    const category2 = await Category.create({
      name: "Bedroom Furniture",
      orderId: 2,
    });

    await Category.create({
      name: "Dining Room Furniture",
      orderId: 3,
    });

    await Category.create({
      name: "Office Furniture",
      orderId: 4,
    });
    await Category.create({
      name: "Outdoor Furniture",
      orderId: 5,
    });
    await Category.create({
      name: "Storage",
      orderId: 6,
    });
    await Category.create({
      name: "Other",
      orderId: 6,
    });
    console.log("成功插入分类：", category1, category2);
  } catch (error) {
    console.error("插入分类出错:", error);
  } finally {
    // 断开数据库连接
    await mongoose.disconnect();
  }
}

// 执行插入操作
createCategories();
