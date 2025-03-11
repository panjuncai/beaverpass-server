# 订单系统使用指南

本文档介绍了如何使用基于 Prisma 和 GraphQL 实现的订单系统。

## 开发环境设置

为了便于开发，我们提供了一个模拟的 Prisma 客户端（`src/lib/prisma.js`），它允许您在不配置实际数据库的情况下开发和测试 GraphQL API。

当您准备好使用真实数据库时，请按照以下步骤操作：

1. 修改 `src/lib/prisma.js` 文件，取消对真实 Prisma 客户端的注释
2. 确保 `.env` 文件中包含正确的数据库连接 URL
3. 运行 `npx prisma generate` 生成 Prisma 客户端
4. 运行 `npx prisma migrate dev` 应用数据库迁移

## 实时订阅功能

> **注意：** 订阅功能目前已暂时禁用，以解决兼容性问题。将在后续版本中重新启用。

订单系统设计支持实时订阅功能，允许客户端接收订单状态变更的实时通知。这是通过 GraphQL 订阅和 WebSocket 实现的。

### 客户端设置（暂不可用）

当订阅功能重新启用后，客户端可以使用以下方式设置：

1. 设置 WebSocket 链接：
```javascript
import { createClient } from 'graphql-ws';

const wsClient = createClient({
  url: 'ws://localhost:4000/graphql',
  // 可选的认证
  connectionParams: {
    authToken: 'your-auth-token'
  }
});
```

2. 订阅订单状态变更：
```javascript
const subscription = {
  query: `
    subscription OrderStatusChanged($id: ID) {
      orderStatusChanged(id: $id) {
        id
        status
        updatedAt
      }
    }
  `,
  variables: { id: 'order-id' }, // 可选，如果只想订阅特定订单
};

const unsubscribe = wsClient.subscribe(
  subscription,
  {
    next: (data) => console.log('订单状态已更新:', data),
    error: (error) => console.error('订阅错误:', error),
    complete: () => console.log('订阅已完成'),
  }
);

// 稍后取消订阅
// unsubscribe();
```

## 数据库设计

订单系统使用以下数据库表结构：

```sql
CREATE TYPE order_status_enum AS ENUM (
  'pending_payment', 'paid', 'shipped', 'completed', 'canceled', 'refunded'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 用户关联
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),

  -- 商品快照（交易时的信息）
  post_id UUID NOT NULL REFERENCES posts(id),
  title TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  image_front TEXT NOT NULL,
  image_back TEXT,
  image_left TEXT,
  image_right TEXT,

  -- 收货信息
  shipping_address TEXT NOT NULL,
  shipping_receiver TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,

  -- 支付信息
  payment_method TEXT NOT NULL,
  payment_transaction_id TEXT,

  -- 金额计算相关
  payment_fee NUMERIC(12,2) DEFAULT 0,
  delivery_fee NUMERIC(12,2) DEFAULT 0,
  service_fee NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,

  -- 订单状态
  status order_status_enum DEFAULT 'pending_payment',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 订单状态流程

订单状态流转如下：

1. `PENDING_PAYMENT`：等待付款（初始状态）
2. `PAID`：已付款（买家付款后）
3. `SHIPPED`：已发货（卖家发货后）
4. `COMPLETED`：已完成（买家确认收货后）
5. `CANCELED`：已取消（买家或卖家取消订单）
6. `REFUNDED`：已退款（管理员处理退款后）

## GraphQL API

### 查询

1. 获取单个订单详情：
```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    title
    price
    total
    status
    # ... 其他字段
  }
}
```

2. 获取我的买家订单：
```graphql
query GetMyBuyerOrders($first: Int, $filter: OrderFilterInput) {
  myBuyerOrders(first: $first, filter: $filter) {
    edges {
      node {
        id
        title
        price
        status
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

3. 获取我的卖家订单：
```graphql
query GetMySellerOrders($first: Int, $filter: OrderFilterInput) {
  mySellerOrders(first: $first, filter: $filter) {
    edges {
      node {
        id
        title
        price
        status
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 变更

1. 创建订单：
```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    title
    price
    status
  }
}
```

2. 更新订单：
```graphql
mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
  updateOrder(id: $id, input: $input) {
    id
    status
  }
}
```

3. 取消订单：
```graphql
mutation CancelOrder($id: ID!) {
  cancelOrder(id: $id) {
    id
    status
  }
}
```

4. 完成订单：
```graphql
mutation CompleteOrder($id: ID!) {
  completeOrder(id: $id) {
    id
    status
  }
}
```

### 订阅

订阅订单状态变更：
```graphql
subscription OrderStatusChanged($id: ID) {
  orderStatusChanged(id: $id) {
    id
    status
  }
}
```

## 使用示例

请参考 `examples/orderQueries.js` 文件，了解如何在客户端使用这些 API。

## 权限控制

- 买家可以：创建订单、查看自己的订单、更新自己的订单收货信息、取消未发货的订单、确认收货
- 卖家可以：查看自己的订单、更新订单为已发货状态、取消未发货的订单
- 管理员可以：查看所有订单、更新任何订单状态、处理退款

## 部署步骤

1. 确保已安装依赖：
```bash
npm install @prisma/client
```

2. 生成 Prisma 客户端：
```bash
npx prisma generate
```

3. 应用数据库迁移：
```bash
npx prisma migrate dev
```

4. 启动服务器：
```bash
npm start
``` 