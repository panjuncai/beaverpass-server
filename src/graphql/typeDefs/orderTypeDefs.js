import { gql } from 'apollo-server-express';

export default gql`
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
    status: OrderStatus!
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
    updateOrderStatus(id: ID!, status: OrderStatus!): OrderResponse!
    updateOrder(id: ID!, status: OrderStatus, paymentTransactionId: String): OrderResponse!
    cancelOrder(id: ID!): OrderResponse!
  }
`; 