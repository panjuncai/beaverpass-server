import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 创建 S3 客户端，指定区域及凭证
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // 从环境变量读取
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 生成预签名URL
const generatePresignedUrl = async (fileName, fileType) => {
  try {
    // 生成唯一的文件名，避免覆盖
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    // 预签名 URL 过期时间设置为 1 小时（3600秒）
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // 构建文件的公共访问URL
    const fileUrl = `https://beaverpassbucket.s3.us-east-2.amazonaws.com/${uniqueFileName}`;
    console.log(fileUrl);
    return {
      url,
      fileUrl
    };
  } catch (error) {
    console.error("Error generating presigned URL", error);
    throw new Error(`Generate presigned URL failed: ${error.message}`);
  }
};

export default generatePresignedUrl;