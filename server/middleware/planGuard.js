const PLAN_LIMITS = {
  free: {
    maxPublicRepos: 3,
    maxPrivateRepos: 0,
    maxCollaborators: 2,
    maxPushesPerMonth: 10
  },
  pro: {
    maxPublicRepos: Infinity,
    maxPrivateRepos: Infinity,
    maxCollaborators: 10,
    maxPushesPerMonth: Infinity
  },
  team: {
    maxPublicRepos: Infinity,
    maxPrivateRepos: Infinity,
    maxCollaborators: Infinity,
    maxPushesPerMonth: Infinity
  }
};

/**
 * Middleware factory: checks a plan limit before allowing an action.
 * Usage: planGuard('maxPublicRepos', async (req) => currentCount)
 */
const planGuard = (limitKey, getCurrentCount) => async (req, res, next) => {
  try {
    const plan = req.user.plan || 'free';
    const limits = PLAN_LIMITS[plan];
    const limit = limits[limitKey];

    if (limit === Infinity) return next();

    const current = await getCurrentCount(req);
    if (current >= limit) {
      return res.status(403).json({
        message: `You have reached your ${plan} plan limit for this feature.`,
        limitKey,
        limit,
        current,
        upgradeRequired: true,
        plan
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { planGuard, PLAN_LIMITS };
