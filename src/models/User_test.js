const mongoose = require("mongoose");
const User = require("./User"); 

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
    const data = [
        {
          _id: new mongoose.Types.ObjectId("679109b949dbdb5669f21b0e"),
          email: "panjc_job@163.com",
          firstName:'Jerry',
          lastName:'Pan',
          avatar: "1",
          password:"$2a$10$TtZVDUaWt//ZnvCgtOV/w.j02ta2sr2TZMkOtC4V4Xq1Ric5gCtJq",
          isVerified:true,
        },
        {
            _id: new mongoose.Types.ObjectId("67addbb672e5f1e717c354ad"),
            email: "qqxpp0001@126.com",
            firstName:'Tom',
            lastName:'Yu',
            avatar: "2",
            password:"$2a$10$VCwhKwihISCwCSQncESkS.BRoYza7a1m2LFGPuUH72TlYQiNMOcnq",
            isVerified:true,
          },
    ]
     try {
        // 使用 insertMany 插入多条记录
        const createdData = await User.insertMany(data);
        console.log("Mock data created:", createdData);
      } catch (error) {
        console.error("Error creating data:", error);
      } finally {
        // 断开连接
        mongoose.disconnect();
      }
}

test();
