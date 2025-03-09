import express from 'express';
import userController from '../controllers/userController';
import auth from '../middlewares/authMiddleware';
import mongoose from 'mongoose';
const router = express.Router();

// 使用 router.param 针对 id 参数进行预处理和验证
router.param("id", (req, res, next, id) => {
  // 如果没有传入有效的 id，则返回 400 错误
  if (!id) {
    return res.status(400).json({ code: 1, msg: "User id is required" });
  }

  // 验证 id 是否为有效的 MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ code: 1, msg: "Invalid user id format" });
  }

  next();
});

// 获取用户信息
router.get("/:userId", userController.getUserById);

// 更新用户信息（需要认证）
router.patch("/:userId", auth, userController.updateUser);

export default router;
