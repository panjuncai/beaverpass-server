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
  }

  # 用户响应类型
  type UserResponse {
    code: Int!
    success: Boolean!
    message: String!
    user: User
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
    users: [User!]!
  }

  # 变更
  extend type Mutation {
    updateUser(input: UpdateUserInput!): UserResponse!
  }
`; 