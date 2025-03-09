import { gql } from 'apollo-server-express';

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    avatar: String
    address: String
    phone: String
    createdAt: String!
    updatedAt: String!
  }

  # 用户响应类型
  type UserRsp implements BaseRsp {
    code: Int!
    msg: String!
    data: User
  }
  
  type Query {
    getUserByEmail(email: String!): UserRsp!
    getUserById(id: ID!): UserRsp!
    checkSession: UserRsp!
  }

  input RegisterReq {
    email: String! @constraint(format: "email")
    password: String! @constraint(minLength: 1,maxLength: 20)
    confirmPassword: String! @constraint(minLength: 1,maxLength: 20)
    firstName: String! @constraint(maxLength: 50)
    lastName: String! @constraint(maxLength: 50)
  }

  input LoginReq {
    email: String! @constraint(format: "email")
    password: String! @constraint(minLength: 1,maxLength: 20)
  }
  
  type Mutation {
    register(input: RegisterReq!): UserRsp!
    login(input: LoginReq!): UserRsp!
    logout: UserRsp!
    verifyUser(verificationToken: String!): UserRsp!
    updateUser(id: ID!, firstName: String, lastName: String, avatar: String, address: String, phone: String): UserRsp!
  }
`;

