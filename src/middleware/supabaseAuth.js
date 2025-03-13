import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

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
    console.log('publicKey', publicKey);
    // 验证令牌
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
    console.log('decoded', decoded);
    // 如果令牌有效，返回用户信息
    if (decoded && decoded.sub) {
      // 从 Supabase 获取用户信息
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.sub)
        .single();
      console.log('user', user);
      if (error || !user) {
        console.error('Error fetching user:', error);
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