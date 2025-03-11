import { gql } from 'apollo-server-express';

const uploadTypes = gql`
  # 预签名URL响应类型
  type PresignedUrlResponse {
    url: String!       # 用于上传的预签名URL
    fileUrl: String!   # 上传后的文件访问URL
  }

  # 扩展现有的Query类型
  extend type Query {
    # 占位符查询，GraphQL要求至少有一个查询
    _uploadPlaceholder: String
  }

  # 扩展现有的Mutation类型
  extend type Mutation {
    # 获取预签名URL的mutation
    getPresignedUrl(
      fileName: String!
      fileType: String!
      fileSize: Int
    ): PresignedUrlResponse!
  }
`;

export default uploadTypes; 