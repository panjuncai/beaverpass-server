const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

// 创建帖子
router.post('/', auth, postController.createPost);

// 获取帖子列表
router.get('/', postController.getPosts);

// 获取单个帖子
router.get('/:id', postController.getPostById);

// 更新帖子状态
router.patch('/:id/status', auth, postController.updatePostStatus);

module.exports = router; 