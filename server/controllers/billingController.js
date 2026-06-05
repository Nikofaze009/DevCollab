const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { stripe, PRICE_IDS } = require('../services/stripe');

// GET /api/billing/status
exports.getBillingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) {
      sub = { plan: 'free', status: 'free', currentPeriodEnd: null };
    }
    res.json({
      plan: user.plan,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      stripeCustomerId: user.stripeCustomerId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/billing/create-checkout
exports.createCheckout = async (req, res) => {
  const { plan } = req.body; // 'pro' or 'team'
  const priceId = PRICE_IDS[plan];

  if (!priceId || priceId.includes('placeholder')) {
    return res.status(400).json({
      message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY and price IDs to your .env file.'
    });
  }

  try {
    const user = await User.findById(req.user._id);
    let customerId = user.stripeCustomerId;

    // Create Stripe customer if not already created
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/billing?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?canceled=true`
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/billing/webhook  (raw body required)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const user = await User.findOne({ stripeCustomerId: customerId });
      if (!user) break;

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = stripeSub.items.data[0].price.id;

      // Determine plan from price ID
      let plan = 'free';
      if (priceId === PRICE_IDS.pro) plan = 'pro';
      else if (priceId === PRICE_IDS.team) plan = 'team';

      await User.findByIdAndUpdate(user._id, { plan });
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          plan,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          status: 'active'
        },
        { upsert: true }
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const user = await User.findOne({ stripeCustomerId: session.customer });
      if (!user) break;
      await User.findByIdAndUpdate(user._id, { plan: 'free' });
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        { plan: 'free', status: 'canceled' }
      );
      break;
    }

    case 'invoice.payment_failed': {
      const user = await User.findOne({ stripeCustomerId: session.customer });
      if (user) {
        await Subscription.findOneAndUpdate(
          { userId: user._id },
          { status: 'past_due' }
        );
      }
      break;
    }
  }

  res.json({ received: true });
};

// GET /api/billing/portal
exports.getBillingPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No billing account found. Please subscribe first.' });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/billing`
    });
    res.json({ url: portalSession.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
