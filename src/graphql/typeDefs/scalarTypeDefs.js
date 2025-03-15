import { gql } from 'apollo-server-express';

const scalarTypeDefs = gql`
  """
  日期时间标量类型，使用 ISO-8601 格式字符串
  """
  scalar DateTime
`;

export default scalarTypeDefs; 