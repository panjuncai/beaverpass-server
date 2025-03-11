import generatePresignedUrl from '../../utils/s3.js';

const uploadResolvers = {
  Query: {
    _uploadPlaceholder: () => "This is a placeholder"
  },
  
  Mutation: {
    getPresignedUrl: async (_, { fileName, fileType, fileSize }, { req }) => {
      // 验证用户是否已登录
      if (!req.session.user) {
        throw new Error('Authentication required');
      }
      
      // 验证请求参数
      if (!fileName || !fileType) {
        throw new Error('fileName and fileType are required');
      }
      
      // 验证文件大小（如果提供）
      if (fileSize && fileSize > 10 * 1024 * 1024) { // 10MB 限制
        throw new Error('file size cannot exceed 10MB');
      }
      
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(fileType)) {
        throw new Error('Unsupported file type');
      }
      
      try {
        // 生成预签名URL
        const { url, fileUrl } = await generatePresignedUrl(fileName, fileType);
        
        return {
          url,
          fileUrl
        };
      } catch (error) {
        console.error('Failed to get presigned URL:', error);
        throw new Error(error.message || 'Server error');
      }
    }
  }
};

export default uploadResolvers;