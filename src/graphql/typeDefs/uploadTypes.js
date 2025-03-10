import { gql } from 'apollo-server-express';

const uploadTypes = gql`

  type PresignedUrlRsp {
    url: String!       # 用于上传的预签名URL
    fileUrl: String!   # 上传后的文件访问URL
  }

  type Query {
    _uploadPlaceholder: String
  }

  input UploadReq {
    fileName: String!
    fileType: String!
    fileSize: Int
  }

  type Mutation {
    getPresignedUrl(
      input: UploadReq!
    ): PresignedUrlRsp!
  }
`;

export default uploadTypes; 