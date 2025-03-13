import { gql } from 'apollo-server-express';

const baseTypeDefs = gql`
  # 自定义标量类型
  scalar DateTime

  # 定义响应接口
  interface BaseRsp {
    code: Int!
    msg: String!
  }
`;
export default baseTypeDefs;