import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

// 白名单接口直接放行
const operationsWithoutAuth = ['Login','Register','VerifyUser','CheckSession','Logout'];
const auth = async (req, res, next) => {
  try {
    // Check for token in session
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return next();
      }
      
      // Set user in request
      req.user = user;
      
      // Also set in session for compatibility
      req.session.user = user;
      
      return next();
    } catch (error) {
      // Invalid token
      return next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next();
  }
};

export default auth;
