import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { prisma } from '../config/db.js';

/**
 * 验证 Supabase JWT 令牌
 * @param {string} token - JWT 令牌
 * @returns {Promise<Object|null>} - 解码后的用户信息或 null
 */
export const verifySupabaseToken = async (token) => {
  try {
    if (!token) return null;

    // 从 Supabase 获取 JWT 密钥
    const { data: { publicKey } } = await supabase.rpc('get_jwt_public_key');
    
    // 验证令牌
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
    
    // 如果令牌有效，返回用户信息
    if (decoded && decoded.sub) {
      // 从数据库获取用户信息
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub }
      });
      
      if (!user) {
        console.error('User not found in database');
        return null;
      }
      
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
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
      console.error('Invalid token:', error);
      return next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next();
  }
};

export default supabaseAuth; 