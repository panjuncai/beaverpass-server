import express from 'express';
const router = express.Router();
import uploadController from '../controllers/uploadController';
import auth from '../middlewares/authMiddleware';

// 获取预签名URL（需要登录）
router.post('/presigned-url', auth, uploadController.getPresignedUrl);

export default router;