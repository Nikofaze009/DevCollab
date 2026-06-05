const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { lsAPI, VARIANT_IDS, getStoreId } = require('../services/lemonsqueezy');

// ─── GET /api/billing/status ──────────────────────────────────────────────────
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
      lsCustomerId: user.lsCustomerId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/billing/create-checkout ───────────────────────────────────────
exports.createCheckout = async (req, res) => {
  const { plan } = req.body; // 'pro' or 'team'
  const variantId = VARIANT_IDS[plan];

  if (!variantId) {
    return res.status(400).json({ message: 'Invalid plan selected.' });
  }

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    return res.status(400).json({
      message: 'Lemon Squeezy is not configured. Add LEMONSQUEEZY_API_KEY to server/.env'
    });
  }

  try {
    const user = await User.findById(req.user._id);
    const storeId = await getStoreId();
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

    const response = await lsAPI.post('/checkouts', {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            name: user.username,
            custom: {
              user_id: user._id.toString()
            }
          },
          product_options: {
            redirect_url: `${CLIENT_URL}/billing?success=true`,
          },
          checkout_options: {
            embed: false,
          }
        },
        relationships: {
          store: {
            data: { type: 'stores', id: String(storeId) }
          },
          variant: {
            data: { type: 'variants', id: String(variantId) }
          }
        }
      }
    });

    const checkoutUrl = response.data.data.attributes.url;
    res.json({ url: checkoutUrl });
  } catch (err) {
    console.error('LS Checkout error:', err.response?.data || err.message);
    res.status(500).json({
      message: err.response?.data?.errors?.[0]?.detail || err.message
    });
  }
};

// ─── POST /api/billing/webhook ────────────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  // Verify webhook signature if secret is set
  if (secret) {
    const signature = req.headers['x-signature'];
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (hmac !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  const eventName = payload.meta?.event_name;
  const data = payload.data?.attributes;
  const meta = payload.meta;

  console.log(`[Webhook] Received: ${eventName}`);

  try {
    switch (eventName) {

      case 'subscription_created':
      case 'subscription_updated': {
        const userId = meta?.custom_data?.user_id;
        if (!userId) break;

        const variantId = String(data.variant_id);
        let plan = 'free';
        if (variantId === String(VARIANT_IDS.pro))  plan = 'pro';
        if (variantId === String(VARIANT_IDS.team)) plan = 'team';

        const lsCustomerId   = String(data.customer_id);
        const lsSubId        = String(payload.data.id);
        const currentPeriodEnd = data.renews_at ? new Date(data.renews_at) : null;
        const status         = data.status === 'active' ? 'active' : data.status;

        await User.findByIdAndUpdate(userId, { plan, lsCustomerId });
        await Subscription.findOneAndUpdate(
          { userId },
          {
            plan,
            lsCustomerId,
            lsSubscriptionId: lsSubId,
            currentPeriodEnd,
            status
          },
          { upsert: true }
        );
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const userId = meta?.custom_data?.user_id;
        if (!userId) break;
        await User.findByIdAndUpdate(userId, { plan: 'free' });
        await Subscription.findOneAndUpdate(
          { userId },
          { plan: 'free', status: 'canceled' }
        );
        break;
      }

      case 'subscription_payment_failed': {
        const userId = meta?.custom_data?.user_id;
        if (userId) {
          await Subscription.findOneAndUpdate(
            { userId },
            { status: 'past_due' }
          );
        }
        break;
      }
    }
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
  }

  res.json({ received: true });
};

// ─── GET /api/billing/portal ──────────────────────────────────────────────────
exports.getBillingPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sub  = await Subscription.findOne({ userId: req.user._id });

    if (!sub?.lsSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found.' });
    }

    // Fetch subscription from LS to get customer portal URL
    const response = await lsAPI.get(`/subscriptions/${sub.lsSubscriptionId}`);
    const portalUrl = response.data.data.attributes.urls?.customer_portal;

    if (!portalUrl) {
      return res.status(400).json({ message: 'Portal URL not available.' });
    }

    res.json({ url: portalUrl });
  } catch (err) {
    console.error('LS Portal error:', err.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
};
