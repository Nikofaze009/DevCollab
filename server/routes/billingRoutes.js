const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBillingStatus,
  createCheckout,
  handleWebhook,
  getBillingPortal
} = require('../controllers/billingController');

// Stripe webhook needs raw body — must be defined before express.json() in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.get('/status', protect, getBillingStatus);
router.post('/create-checkout', protect, createCheckout);
router.get('/portal', protect, getBillingPortal);

module.exports = router;
