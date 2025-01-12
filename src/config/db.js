const mongoose = require("mongoose");
const dotenv = require("dotenv");

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    await mongoose.connect(dbUri);
    console.log("MongoDB Connected");
  } catch (e) {
    console.error("MongoDB connection error:", e);
    process.exit(1);
  }
};

module.exports = connectDB;
