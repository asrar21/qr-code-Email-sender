// src/controllers/subscriptionController.js
const { db } = require('../config/firebase');

// Get all subscription plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await db.get('subscriptions');
    
    if (!plans) {
      // Initialize with default plans if none exist
      const defaultPlans = {
        free: {
          tier: 'free',
          price: 0,
          qrCodesLimit: 10,
          features: ['Basic QR Generation', 'Standard Colors']
        },
        basic: {
          tier: 'basic',
          price: 9.99,
          qrCodesLimit: 50,
          features: ['Custom Colors', 'QR Analytics', 'Email Delivery']
        },
        premium: {
          tier: 'premium',
          price: 19.99,
          qrCodesLimit: 200,
          features: ['All Basic Features', 'Priority Support', 'API Access']
        }
      };
      
      await db.set('subscriptions', defaultPlans);
      return res.json({ success: true, plans: Object.values(defaultPlans) });
    }
    
    res.json({
      success: true,
      plans: Object.values(plans)
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Error fetching subscription plans' });
  }
};

// Subscribe to a plan
exports.subscribe = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Get the selected plan
    const plans = await db.get('subscriptions');
    const plan = plans[planId];
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Update user's subscription
    await db.update(`users/${userId}`, {
      subscriptionTier: plan.tier,
      subscriptionActive: true,
      subscriptionSince: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Record subscription history
    const subscriptionId = `sub_${Date.now()}`;
    await db.set(`subscription_history/${subscriptionId}`, {
      userId,
      planId,
      planTier: plan.tier,
      price: plan.price,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    });

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan.tier} plan`,
      subscription: {
        tier: plan.tier,
        features: plan.features,
        subscribedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Error processing subscription' });
  }
};

// Get user's current subscription
exports.getMySubscription = async (req, res) => {
  try {
    const user = req.user;
    
    // Get subscription plan details
    const plans = await db.get('subscriptions');
    const plan = plans[user.subscriptionTier] || plans.free;

    res.json({
      success: true,
      subscription: {
        tier: user.subscriptionTier || 'free',
        currentUsage: user.qrCodesGenerated || 0,
        ...plan
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Error fetching subscription' });
  }
};