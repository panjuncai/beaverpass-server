const supabase = require('../lib/supabase');

// 根据ID获取用户信息
const getUserById = async (userId) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!user) {
      throw new Error("User is not exists");
    }
    
    // 移除敏感字段
    delete user.password;
    delete user.verificationToken;
    
    return user;
  } catch (e) {
    throw e;
  }
};

// 更新用户信息
const updateUser = async (userId, userData) => {
  try {
    // 验证用户是否存在
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!user) {
      throw new Error("User is not exists");
    }
    
    // 只更新提供的字段
    const allowedFields = ["firstName", "lastName", "address", "avatar", "phone"];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    }
    
    // 添加更新时间
    updateData.updated_at = new Date();
    
    // 更新用户信息
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    // 移除敏感字段
    delete updatedUser.password;
    delete updatedUser.verificationToken;
    
    return updatedUser;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  getUserById,
  updateUser
};