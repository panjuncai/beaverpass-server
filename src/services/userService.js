const User = require("../models/User");

// 根据ID获取用户信息
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User is not exists");
    }
    
    return user;
  } catch (e) {
    throw e;
  }
};

// 更新用户信息
const updateUser = async (userId, userData) => {
  try {
    // 查找用户
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User is not exists");
    }
    
    // 只更新提供的字段
    const allowedFields = ["firstName", "lastName", "address", "avatar","phone"];
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        user[field] = userData[field];
      }
    }
    
    // 保存更新后的用户信息
    await user.save();
    
    // 返回更新后的用户信息（不包含敏感字段）
    const updatedUser = await User.findById(userId);
    
    return updatedUser;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  getUserById,
  updateUser
};