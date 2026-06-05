const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'team'],
    default: 'free'
  },
  stripeCustomerId: {
    type: String,
    default: ''
  },
  stripeSubscriptionId: {
    type: String,
    default: ''
  },
  currentPeriodEnd: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'free'],
    default: 'free'
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
