import express from 'express';
const router = express.Router();
import auth from '../middlewares/authMiddleware';
import postController from '../controllers/postController';

// 创建帖子
router.post('/', auth, postController.createPost);

// 获取帖子列表
router.get('/', postController.getPosts);

// 获取当前用户的帖子
router.get('/me', auth, postController.getMyPosts);

// 获取单个帖子
router.get('/:id', postController.getPostById);

// 更新帖子状态
router.patch('/:id/status', auth, postController.updatePostStatus);



export default router; 