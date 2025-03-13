const { gql } = require('apollo-server-express');

module.exports = gql`
  enum OrderStatus {
    PENDING_PAYMENT
    PAID
    SHIPPED
    COMPLETED
    CANCELED
    REFUNDED
  }

  type Order {
    id: ID!
    buyer: User!
    buyerId: ID!
    seller: User!
    sellerId: ID!
    post: Post!
    postId: ID!
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
    status: OrderStatus!
    createdAt: String
    updatedAt: String
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
    status: OrderStatus
    paymentTransactionId: String
  }

  extend type Query {
    orders: [Order]
    order(id: ID!): Order
    userOrders(userId: ID!): [Order]
    buyerOrders(buyerId: ID!): [Order]
    sellerOrders(sellerId: ID!): [Order]
  }

  extend type Mutation {
    createOrder(input: CreateOrderInput!): Order
    updateOrder(input: UpdateOrderInput!): Order
    cancelOrder(id: ID!): Order
  }
`; 