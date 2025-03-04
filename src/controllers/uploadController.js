const s3Utils = require('../utils/s3');

/**
 * 生成预签名URL
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;
    console.log(fileName, fileType, fileSize);
    // 验证请求参数
    if (!fileName || !fileType) {
      return res.status(400).json({
        code: 1,
        msg: 'fileName and fileType are required'
      });
    }
    
    // 验证文件大小（如果提供）
    if (fileSize && fileSize > 10 * 1024 * 1024) { // 10MB 限制
      return res.status(400).json({
        code: 1,
        msg: 'file size cannot exceed 10MB'
      });
    }
    
    // 验证文件类型（可选，根据需求添加）
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        code: 1,
        msg: 'Unsupported file type'
      });
    }
    
    // 生成预签名URL
    const { url, fileUrl } = await s3Utils.generatePresignedUrl(fileName, fileType);
    
    res.status(200).json({
      code: 0,
      msg: 'Presigned URL generated successfully',
      data: {
        url,
        fileUrl
      }
    });
  } catch (error) {
    console.error('Failed to get presigned URL:', error);
    res.status(500).json({
      code: 1,
      msg: error.message || 'Server error'
    });
  }
};

module.exports = {
  getPresignedUrl
}; 