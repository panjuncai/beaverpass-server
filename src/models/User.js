const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, unique: true },
    lastName: { type: String, unique: true },
    avatar: { type: String },
    address: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, required: true },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
