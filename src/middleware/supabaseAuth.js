import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

/**
 * 验证 Supabase JWT 令牌
 * @param {string} token - JWT 令牌
 * @returns {Promise<Object|null>} - 解码后的用户信息或 null
 */
export const verifySupabaseToken = async (token) => {
  try {
    if (!token) {
      console.log('🔍 令牌验证: 未提供令牌');
      return null;
    }

    console.log('🔍 令牌验证: 开始验证令牌');
    console.log(`🔍 令牌前20个字符: ${token.substring(0, 20)}...`);

    // 方法1: 使用 Supabase Auth API 直接验证令牌
    console.log('🔍 令牌验证: 使用 Supabase Auth API 验证令牌...');
    
    // 设置 Supabase 客户端的会话
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('🚫 令牌验证失败:', error);
      return null;
    }
    
    if (!user) {
      console.log('🚫 令牌有效但未找到用户');
      return null;
    }
    
    console.log('✅ 令牌验证成功');
    console.log('🔍 用户信息:', JSON.stringify(user, null, 2));
    
    return user;
  } catch (error) {
    console.error('🚫 令牌验证错误:', error);
    return null;
  }
};

/**
 * 从请求头中提取 JWT 令牌
 * @param {Object} req - Express 请求对象
 * @returns {string|null} - JWT 令牌或 null
 */
export const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // 移除 "Bearer " 前缀
  }
  
  return null;
};

/**
 * Supabase 身份验证中间件
 * 验证请求中的 JWT 令牌并将用户信息添加到请求对象
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件函数
 */
const supabaseAuth = async (req, res, next) => {
  try {
    // 检查请求头中的令牌
    const token = extractTokenFromRequest(req);
    if (!token) {
      return next();
    }
    
    try {
      // 验证 Supabase 令牌
      const user = await verifySupabaseToken(token);
      
      if (!user) {
        return next();
      }
      
      // 设置用户信息到请求对象
      req.user = user;
      
      return next();
    } catch (error) {
      // 无效令牌
      console.error('🚫 无效令牌:', error);
      return next();
    }
  } catch (error) {
    console.error('🚫 身份验证中间件错误:', error);
    return next();
  }
};

export default supabaseAuth; 