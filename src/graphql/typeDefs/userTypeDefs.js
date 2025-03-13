const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    avatar: String
    address: String
    phone: String
    isVerified: Boolean
    createdAt: String
    updatedAt: String
    posts: [Post]
    buyerOrders: [Order]
    sellerOrders: [Order]
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    avatar: String
    address: String
    phone: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users: [User]
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(input: UpdateUserInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    verifyEmail(token: String!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
  }
`; 