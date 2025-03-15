/**
 * 订单相关的 GraphQL 查询示例
 */

// 创建订单
const CREATE_ORDER = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      title
      price
      total
      status
      createdAt
    }
  }
`;

// 获取单个订单详情
const GET_ORDER = `
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      title
      price
      imageFront
      imageBack
      imageLeft
      imageRight
      shippingAddress
      shippingReceiver
      shippingPhone
      paymentMethod
      paymentTransactionId
      paymentFee
      deliveryFee
      serviceFee
      tax
      total
      status
      createdAt
      updatedAt
      buyer {
        id
      }
      seller {
        id
      }
      post {
        id
        title
      }
    }
  }
`;

// 获取我的买家订单列表
const GET_MY_BUYER_ORDERS = `
  query GetMyBuyerOrders($first: Int, $after: String, $filter: OrderFilterInput, $orderBy: OrderOrderByInput) {
    myBuyerOrders(first: $first, after: $after, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          id
          title
          price
          total
          status
          createdAt
          seller {
            id
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// 获取我的卖家订单列表
const GET_MY_SELLER_ORDERS = `
  query GetMySellerOrders($first: Int, $after: String, $filter: OrderFilterInput, $orderBy: OrderOrderByInput) {
    mySellerOrders(first: $first, after: $after, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          id
          title
          price
          total
          status
          createdAt
          buyer {
            id
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// 更新订单
const UPDATE_ORDER = `
  mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      id
      status
      updatedAt
    }
  }
`;

// 取消订单
const CANCEL_ORDER = `
  mutation CancelOrder($id: ID!) {
    cancelOrder(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

// 完成订单
const COMPLETE_ORDER = `
  mutation CompleteOrder($id: ID!) {
    completeOrder(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

// 订阅订单状态变更
const SUBSCRIBE_TO_ORDER_STATUS = `
  subscription OrderStatusChanged($id: ID) {
    orderStatusChanged(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

// 使用示例

// 创建订单
async function createOrder(sellerId, postId) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify({
      query: CREATE_ORDER,
      variables: {
        input: {
          sellerId,
          postId,
          shippingAddress: '123 Main St, Anytown, CA 12345',
          shippingReceiver: 'John Doe',
          shippingPhone: '555-123-4567',
          paymentMethod: 'credit_card'
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Order created:', result.data.createOrder);
  return result.data.createOrder;
}

// 获取订单详情
async function getOrder(orderId) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify({
      query: GET_ORDER,
      variables: {
        id: orderId
      }
    })
  });
  
  const result = await response.json();
  console.log('Order details:', result.data.order);
  return result.data.order;
}

// 获取我的买家订单
async function getMyBuyerOrders(status = null, first = 10) {
  const filter = status ? { status } : {};
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify({
      query: GET_MY_BUYER_ORDERS,
      variables: {
        first,
        filter,
        orderBy: { createdAt: 'DESC' }
      }
    })
  });
  
  const result = await response.json();
  console.log('My buyer orders:', result.data.myBuyerOrders);
  return result.data.myBuyerOrders;
}

// 更新订单状态（例如，标记为已付款）
async function markOrderAsPaid(orderId, transactionId) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify({
      query: UPDATE_ORDER,
      variables: {
        id: orderId,
        input: {
          status: 'PAID',
          paymentTransactionId: transactionId
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Order updated:', result.data.updateOrder);
  return result.data.updateOrder;
}

// 取消订单
async function cancelOrder(orderId) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify({
      query: CANCEL_ORDER,
      variables: {
        id: orderId
      }
    })
  });
  
  const result = await response.json();
  console.log('Order canceled:', result.data.cancelOrder);
  return result.data.cancelOrder;
}

// 导出查询和函数
export {
  CREATE_ORDER,
  GET_ORDER,
  GET_MY_BUYER_ORDERS,
  GET_MY_SELLER_ORDERS,
  UPDATE_ORDER,
  CANCEL_ORDER,
  COMPLETE_ORDER,
  SUBSCRIBE_TO_ORDER_STATUS,
  createOrder,
  getOrder,
  getMyBuyerOrders,
  markOrderAsPaid,
  cancelOrder
}; 