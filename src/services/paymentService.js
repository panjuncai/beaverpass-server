const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

const createPaymentIntent = async (orderId, userId) => {
  try {
    // 查找订单并验证
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // 验证订单是否属于当前用户
    if (order.buyerId.toString() !== userId.toString()) {
      throw new Error('No access to this order');
    }

    // 验证订单状态
    if (order.status !== 'pending_payment') {
      throw new Error('Order status is not correct');
    }

    // 创建 PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe使用的是最小货币单位（例如，美分）
      currency: 'cad', // 或其他货币代码
      metadata: {
        orderId: order._id.toString(),
        buyerId: userId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Create payment intent failed: ${error.message}`);
  }
};

// 处理 Stripe Webhook
const handleStripeWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
    }
  } catch (error) {
    throw new Error(`Handle Stripe Webhook failed: ${error.message}`);
  }
};

// 处理支付成功
const handlePaymentSuccess = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // 更新订单状态
  order.status = 'paid';
  order.paymentInfo = {
    method: 'stripe',
    transactionId: paymentIntent.id
  };
  
  await order.save();
};

// 处理支付失败
const handlePaymentFailure = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // 更新订单状态
  order.status = 'payment_failed';
  await order.save();
};

module.exports = {
  createPaymentIntent,
  handleStripeWebhook
}; 