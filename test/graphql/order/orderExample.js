/**
 * 订单 API 使用示例
 * 
 * 这个示例展示了如何使用订单相关的 GraphQL API。
 */

// 导入订单查询
import {
  createOrder,
  getOrder,
  getMyBuyerOrders,
  markOrderAsPaid,
  cancelOrder
} from './orderQueries.js';

// 模拟订单流程
async function simulateOrderFlow() {
  try {
    console.log('===== 订单流程示例 =====');
    
    // 步骤 1: 创建订单
    console.log('\n1. 创建订单');
    const sellerId = 'seller-123';
    const postId = 'post-456';
    const order = await createOrder(sellerId, postId);
    console.log(`订单创建成功: ${order.id}`);
    
    // 步骤 2: 获取订单详情
    console.log('\n2. 获取订单详情');
    const orderDetails = await getOrder(order.id);
    console.log('订单详情:', orderDetails);
    
    // 步骤 3: 支付订单
    console.log('\n3. 支付订单');
    const transactionId = 'txn-' + Date.now();
    const paidOrder = await markOrderAsPaid(order.id, transactionId);
    console.log(`订单已支付: ${paidOrder.status}`);
    
    // 步骤 4: 获取买家订单列表
    console.log('\n4. 获取买家订单列表');
    const myOrders = await getMyBuyerOrders('PAID');
    console.log(`找到 ${myOrders.totalCount} 个已支付订单`);
    
    // 步骤 5: 取消订单（可选）
    if (Math.random() > 0.5) {
      console.log('\n5. 取消订单');
      const canceledOrder = await cancelOrder(order.id);
      console.log(`订单已取消: ${canceledOrder.status}`);
    }
    
    console.log('\n===== 订单流程完成 =====');
  } catch (error) {
    console.error('订单流程出错:', error.message);
  }
}

// 运行示例
simulateOrderFlow();

// 导出示例函数
export default simulateOrderFlow; 