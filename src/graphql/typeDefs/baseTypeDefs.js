import { gql } from 'apollo-server-express';

const baseTypeDefs = gql`
  # 定义响应接口
  interface BaseRsp {
    code: Int!
    msg: String!
  }
`;
export default baseTypeDefs;