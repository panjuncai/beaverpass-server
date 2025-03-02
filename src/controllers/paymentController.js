const paymentService = require('../services/paymentService');

const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const paymentIntent = await paymentService.createPaymentIntent(orderId, req.user._id);
    
    res.status(200).json({
      code: 0,
      msg: "Create payment intent successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    res.status(400).json({
      code: 1,
      msg: error.message
    });
  }
};

module.exports = {
  createPaymentIntent
}; 