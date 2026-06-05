// Stripe service — initialises and exports the Stripe client.
// Set STRIPE_SECRET_KEY in your .env file.
// For testing use: sk_test_...
// For production use: sk_live_...

const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Price IDs from your Stripe dashboard (test mode).
// Replace these with your actual Price IDs after creating products in Stripe.
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
  team: process.env.STRIPE_TEAM_PRICE_ID || 'price_team_placeholder'
};

module.exports = { stripe, PRICE_IDS };
