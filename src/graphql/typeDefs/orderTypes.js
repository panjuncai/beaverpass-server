import { gql } from 'apollo-server-express';

const orderTypes = gql`
  # 订单状态枚举
  enum OrderStatus {
    PENDING_PAYMENT
    PAID
    SHIPPED
    COMPLETED
    CANCELED
    REFUNDED
  }

  # 订单类型
  type Order {
    id: ID!
    
    # 用户关联
    buyerId: ID!
    buyer: User!
    sellerId: ID!
    seller: User!

    # 商品快照
    postId: ID!
    post: Post!
    title: String!
    price: Float!
    imageFront: String!
    imageBack: String
    imageLeft: String
    imageRight: String

    # 收货信息
    shippingAddress: String!
    shippingReceiver: String!
    shippingPhone: String!

    # 支付信息
    paymentMethod: String!
    paymentTransactionId: String

    # 金额计算相关
    paymentFee: Float!
    deliveryFee: Float!
    serviceFee: Float!
    tax: Float!
    total: Float!

    # 订单状态
    status: OrderStatus!

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # 订单创建输入
  input CreateOrderInput {
    # 用户关联
    sellerId: ID!

    # 商品关联
    postId: ID!

    # 收货信息
    shippingAddress: String!
    shippingReceiver: String!
    shippingPhone: String!

    # 支付信息
    paymentMethod: String!
  }

  # 订单更新输入
  input UpdateOrderInput {
    # 支付信息
    paymentTransactionId: String
    
    # 订单状态
    status: OrderStatus
    
    # 收货信息
    shippingAddress: String
    shippingReceiver: String
    shippingPhone: String
  }

  # 订单分页结果
  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # 订单边
  type OrderEdge {
    node: Order!
    cursor: String!
  }

  # 分页信息
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # 订单过滤条件
  input OrderFilterInput {
    status: OrderStatus
    buyerId: ID
    sellerId: ID
    createdAfter: DateTime
    createdBefore: DateTime
  }

  # 订单排序输入
  input OrderOrderByInput {
    createdAt: SortDirection
    updatedAt: SortDirection
    total: SortDirection
  }

  # 排序方向
  enum SortDirection {
    ASC
    DESC
  }

  # 扩展查询
  extend type Query {
    # 获取单个订单
    order(id: ID!): Order
    
    # 获取订单列表（分页）
    orders(
      first: Int
      after: String
      last: Int
      before: String
      filter: OrderFilterInput
      orderBy: OrderOrderByInput
    ): OrderConnection!
    
    # 获取我的买家订单
    myBuyerOrders(
      first: Int
      after: String
      filter: OrderFilterInput
      orderBy: OrderOrderByInput
    ): OrderConnection!
    
    # 获取我的卖家订单
    mySellerOrders(
      first: Int
      after: String
      filter: OrderFilterInput
      orderBy: OrderOrderByInput
    ): OrderConnection!
  }

  # 扩展变更
  extend type Mutation {
    # 创建订单
    createOrder(input: CreateOrderInput!): Order!
    
    # 更新订单
    updateOrder(id: ID!, input: UpdateOrderInput!): Order!
    
    # 取消订单
    cancelOrder(id: ID!): Order!
    
    # 完成订单
    completeOrder(id: ID!): Order!
    
    # 退款订单
    refundOrder(id: ID!): Order!
  }

  # 扩展订阅
  extend type Subscription {
    # 订单状态变更
    orderStatusChanged(id: ID): Order!
  }
`;

export default orderTypes; 