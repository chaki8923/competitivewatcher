import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// プランIDを環境変数で管理
export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    name: 'Pro',
    price: 8900,
    sitesLimit: 5,
  },
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business',
    name: 'Business',
    price: 19900,
    sitesLimit: 20,
  },
};

