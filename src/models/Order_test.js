const mongoose = require("mongoose");
const Order = require("./Order"); // 根据实际情况调整路径

const dbUri ='mongodb://localhost:27017/beaverpass'; 
// const dbUri ='mongodb://root:iamveryStrong!@101.133.149.17:26214/beaverpass?authSource=admin'; 
const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log("MongoDB Connected");
  } catch (e) {
    console.error("MongoDB connection error:", e);
    process.exit(1);
  }
};

connectDB();

async function test() {

  // 准备 5 条 mock 订单数据
  const orders = [
    {
      buyerId: new mongoose.Types.ObjectId("679109b949dbdb5669f21b0e"),
      sellerId: new mongoose.Types.ObjectId("67addbb672e5f1e717c354ad"),
      productSnapshot: {
        productId: new mongoose.Types.ObjectId("67add7cf8a67a70024c2c640"),
        title: "Product 1",
        price: 100,
        images: [
          "https://gw.alicdn.com/imgextra/i3/2212469562343/O1CN01CTBZVa1TB8wDOZ3sQ_!!2212469562343.jpg_240x10000Q75.jpg",
        ],
      },
      amount: 1,
      deliveryFee: 5,
      tax: 3,
      serviceFee: 2,
      paymentFee: 1,
      total: 100 + 5 + 3 + 2 + 1, // 111
      status: "pending_payment",
      paymentInfo: {
        method: "alipay",
        transactionId: "txn001",
      },
      shippingInfo: {
        address: "123 Main St, CityA, CountryX",
        receiver: "Alice",
        phone: "1111111111",
      },
    },
    {
      buyerId: new mongoose.Types.ObjectId("679109b949dbdb5669f21b0e"),
      sellerId: new mongoose.Types.ObjectId("67addbb672e5f1e717c354ad"),
      productSnapshot: {
        productId: new mongoose.Types.ObjectId("67add7cf8a67a70024c2c641"),
        title: "Product 2",
        price: 200,
        images: [
          "https://gw.alicdn.com/imgextra/i1/420966826/O1CN01axInJG20IMXD9ceN3_!!420966826.jpg",
        ],
      },
      amount: 2,
      deliveryFee: 10,
      tax: 6,
      serviceFee: 4,
      paymentFee: 2,
      total: 2 * 200 + 10 + 6 + 4 + 2, // 422
      status: "paid",
      paymentInfo: {
        method: "wechat_pay",
        transactionId: "txn002",
      },
      shippingInfo: {
        address: "456 Second St, CityB, CountryY",
        receiver: "Bob",
        phone: "2222222222",
      },
    },
    {
      buyerId: new mongoose.Types.ObjectId("679109b949dbdb5669f21b0e"),
      sellerId: new mongoose.Types.ObjectId("67addbb672e5f1e717c354ad"),
      productSnapshot: {
        productId: new mongoose.Types.ObjectId("67add7cf8a67a70024c2c642"),
        title: "Product 3",
        price: 150,
        images: [
          "https://gw.alicdn.com/imgextra/i4/2918377236/O1CN01z4pGFX23K8viQo5It_!!2918377236.jpg",
        ],
      },
      amount: 1,
      deliveryFee: 8,
      tax: 4,
      serviceFee: 3,
      paymentFee: 1,
      total: 150 + 8 + 4 + 3 + 1, // 166
      status: "shipped",
      paymentInfo: {
        method: "card",
        transactionId: "txn003",
      },
      shippingInfo: {
        address: "789 Third Blvd, CityC, CountryZ",
        receiver: "Charlie",
        phone: "3333333333",
      },
    },
    {
      buyerId: new mongoose.Types.ObjectId("679109b949dbdb5669f21b0e"),
      sellerId: new mongoose.Types.ObjectId("67addbb672e5f1e717c354ad"),
      productSnapshot: {
        productId: new mongoose.Types.ObjectId("67add7cf8a67a70024c2c643"),
        title: "Product 4",
        price: 250,
        images: [
          "https://gw.alicdn.com/imgextra/i1/2213530323381/O1CN01AvKykT1aqXzIgbGLf_!!2213530323381.jpg",
        ],
      },
      amount: 3,
      deliveryFee: 12,
      tax: 9,
      serviceFee: 5,
      paymentFee: 3,
      total: 3 * 250 + 12 + 9 + 5 + 3, // 750 + 29 = 779
      status: "completed",
      paymentInfo: {
        method: "alipay",
        transactionId: "txn004",
      },
      shippingInfo: {
        address: "101 Fourth Ave, CityD, CountryW",
        receiver: "Dave",
        phone: "4444444444",
      },
    },
    {
      buyerId: new mongoose.Types.ObjectId("679109b949dbdb5669f21b0e"),
      sellerId: new mongoose.Types.ObjectId("67addbb672e5f1e717c354ad"),
      productSnapshot: {
        productId: new mongoose.Types.ObjectId("67add7cf8a67a70024c2c644"),
        title: "Product 5",
        price: 80,
        images: [
          "https://gw.alicdn.com/imgextra/i1/50966244/O1CN018loTeX1vznYNiSnDZ_!!50966244.jpg",
        ],
      },
      amount: 2,
      deliveryFee: 4,
      tax: 2,
      serviceFee: 1,
      paymentFee: 1,
      total: 2 * 80 + 4 + 2 + 1 + 1, // 160 + 8 = 168
      status: "canceled",
      paymentInfo: {
        method: "wechat_pay",
        transactionId: "txn005",
      },
      shippingInfo: {
        address: "202 Fifth Road, CityE, CountryV",
        receiver: "Eve",
        phone: "5555555555",
      },
    },
  ];

  try {
    const createdOrders = await Order.insertMany(orders);
    console.log("Mock orders created:", createdOrders);
  } catch (error) {
    console.error("Error creating orders:", error);
  } finally {
    mongoose.disconnect();
  }
}

test();
