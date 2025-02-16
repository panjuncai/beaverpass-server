const express = require("express");
const { getUserById } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");
const router = express.Router();

// 使用 router.param 针对 userId 参数进行预处理和验证
router.param("userId", (req, res, next, userId) => {
  // 如果没有传入有效的 userId，则返回 400 错误
  if (!userId) {
    return res.status(400).json({ code: 1, msg: "User id is required" });
  }

  // 可选：如果需要对 userId 进行格式检查（如 MongoDB ObjectId），可以在这里加入校验逻辑
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ code: 1, msg: "Invalid User Id" });
  }

  next();
});

router.get("/", (req, res) => {
  res.status(400).json({ code: 1, msg: "User id is required" });
});

router.get("/:userId", getUserById);

module.exports = router;
