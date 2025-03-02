import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request, Response } from "express";

// 创建 S3 客户端，指定区域及凭证
const s3Client = new S3Client({
  region: "ca-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // 从环境变量读取
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 示例接口：生成预签名 URL
export const generatePresignedUrl = async (req, res) => {
  const { fileName, fileType } = req.body;

  const params = {
    Bucket: "beaverpassbucket",
    Key: fileName,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    // 预签名 URL 过期时间设置为 1 小时（3600秒）
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (error) {
    console.error("Error generating presigned URL", error);
    res.status(500).json({ error: "Error generating presigned URL" });
  }
};
