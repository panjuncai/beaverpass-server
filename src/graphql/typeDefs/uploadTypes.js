import { gql } from 'apollo-server-express';

const uploadTypes = gql`
  # 预签名 URL 响应类型
  type PresignedUrlResponse {
    url: String!
    fileUrl: String!
  }

  input PresignedUrlInput {
    fileName: String!
    fileType: String!
    fileSize: Int
  }
    
  # 扩展现有的Query类型
  extend type Query {
    _uploadPlaceholder: String
  }

  # 扩展现有的Mutation类型
  extend type Mutation {
    getPresignedUrl(input: PresignedUrlInput!): PresignedUrlResponse
  }
`;

export default uploadTypes; 