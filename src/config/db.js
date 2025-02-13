const mongoose = require("mongoose");
require('./env')();

const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB: ${process.env.MONGODB_URI}`);
    const dbUri = process.env.MONGODB_URI;
    await mongoose.connect(dbUri);
    console.log("MongoDB Connected");
  } catch (e) {
    console.error("MongoDB connection error:", e);
    process.exit(1);
  }
};

module.exports = connectDB;
