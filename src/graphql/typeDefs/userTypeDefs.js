import { gql } from 'apollo-server-express';

export default gql`
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    avatar: String
    address: String
    phone: String
    createdAt: String
    updatedAt: String
    posts: [Post]
    buyerOrders: [Order]
    sellerOrders: [Order]
  }

  # 更新用户输入类型
  input UpdateUserInput {
    firstName: String
    lastName: String
    avatar: String
    address: String
    phone: String
  }

  # 查询
  extend type Query {
    me: User
    user(id: ID!): User
  }

  # 变更
  extend type Mutation {
    updateUser(input: UpdateUserInput!): User
  }
`; 