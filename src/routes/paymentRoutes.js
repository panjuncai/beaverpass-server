import express from 'express';
const router = express.Router();
import auth from '../middlewares/authMiddleware';
import paymentController from '../controllers/paymentController';
import loadEnv from '../config/env';
loadEnv();

// 创建支付意向
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);

// Stripe Webhook
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    await paymentService.handleStripeWebhook(event);
    res.json({received: true});
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router; 