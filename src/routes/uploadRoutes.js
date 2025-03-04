const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middlewares/authMiddleware');

// 获取预签名URL（需要登录）
router.post('/presigned-url', auth, uploadController.getPresignedUrl);

module.exports = router; 