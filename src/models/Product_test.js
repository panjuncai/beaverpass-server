const mongoose = require("mongoose");
const Product = require("./Product"); // 调整为你的 Product 模型文件路径

const connectDB = require("../config/db");
connectDB();

async function test() {
    // 准备 5 条 mock 数据
    const products = [
      {
        sellerId: new mongoose.Types.ObjectId('678681d6c5798e6f0aadc3eb'), // 模拟卖家ID
        title: "Product 1",
        description: "Description for product 1",
        category: {
          _id: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a0'),
          name: "Living Room Furniture",
        },
        tags: ["gadget", "tech"],
        price: 199.99,
        condition: "Like New", // 枚举值之一
        images: ["https://gw.alicdn.com/imgextra/i3/2212469562343/O1CN01CTBZVa1TB8wDOZ3sQ_!!2212469562343.jpg_240x10000Q75.jpg"],
        status: "active",
        deliveryOptions: ["Home Delivery", "Pick Up"],
      },
      {
        sellerId: new mongoose.Types.ObjectId('678681d6c5798e6f0aadc3eb'),
        title: "Product 2",
        description: "Description for product 2",
        category: {
          _id: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a7'),
          name: "Books",
        },
        tags: ["novel", "bestseller"],
        price: 29.99,
        condition: "Gently Used",
        images: ["https://gw.alicdn.com/imgextra/i1/420966826/O1CN01axInJG20IMXD9ceN3_!!420966826.jpg"],
        status: "sold",
        deliveryOptions: ["Pick Up"],
      },
      {
        sellerId: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a7'),
        title: "Product 3",
        description: "Description for product 3",
        category: {
          _id: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a9'),
          name: "Clothing",
        },
        tags: ["fashion", "summer"],
        price: 49.99,
        condition: "Minor Scratches",
        images: ["https://gw.alicdn.com/imgextra/i4/2918377236/O1CN01z4pGFX23K8viQo5It_!!2918377236.jpg"],
        status: "active",
        deliveryOptions: ["Home Delivery"],
      },
      {
        sellerId: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a7'),
        title: "Product 4",
        description: "Description for product 4",
        category: {
          _id: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a3'),
          name: "Furniture",
        },
        tags: ["wood", "vintage"],
        price: 399.99,
        condition: "Needs Repair",
        images: ["https://gw.alicdn.com/imgextra/i1/2213530323381/O1CN01AvKykT1aqXzIgbGLf_!!2213530323381.jpg"],
        status: "removed",
        deliveryOptions: ["Pick Up"],
      },
      {
        sellerId: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262a7'),
        title: "Product 5",
        description: "Description for product 5",
        category: {
          _id: new mongoose.Types.ObjectId('67ad4202a11fdc25d45262ad'),
          name: "Toys",
        },
        tags: ["kids", "fun"],
        price: 24.99,
        condition: "Stains",
        images: ["https://gw.alicdn.com/imgextra/i1/50966244/O1CN018loTeX1vznYNiSnDZ_!!50966244.jpg"],
        status: "active",
        deliveryOptions: ["Home Delivery"],
      },
    ];

    try {
      // 使用 insertMany 插入多条记录
      const createdProducts = await Product.insertMany(products);
      console.log("Mock products created:", createdProducts);
    } catch (error) {
      console.error("Error creating products:", error);
    } finally {
      // 断开连接
      mongoose.disconnect();
    }
  }

  test();
