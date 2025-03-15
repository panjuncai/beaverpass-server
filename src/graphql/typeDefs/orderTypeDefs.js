import { gql } from 'apollo-server-express';

export default gql`

  type Order {
    id: ID!
    buyer: User!
    seller: User!
    post: Post!
    title: String!
    price: Float!
    shippingAddress: String!
    shippingReceiver: String!
    shippingPhone: String!
    paymentMethod: String!
    paymentTransactionId: String
    paymentFee: Float
    deliveryFee: Float
    serviceFee: Float
    tax: Float
    total: Float!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateOrderInput {
    postId: ID!
    shippingAddress: String!
    shippingReceiver: String!
    shippingPhone: String!
    paymentMethod: String!
  }

  input UpdateOrderInput {
    id: ID!
    status: String
    paymentTransactionId: String
  }

  type OrderResponse {
    code: Int!
    success: Boolean!
    message: String!
    order: Order
  }

  extend type Query {
    getOrders: [Order!]!
    getOrder(id: ID!): OrderResponse!
    getUserOrders: [Order!]!
    getBuyerOrders: [Order!]!
    getSellerOrders: [Order!]!
  }

  extend type Mutation {
    createOrder(input: CreateOrderInput!): OrderResponse!
    updateOrder(input: UpdateOrderInput!): OrderResponse!
    cancelOrder(id: ID!): OrderResponse!
  }
`; 