import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// プランIDを環境変数で管理
export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    sitesLimit: 3,
    dailyCheckLimit: 5, // 1日5回まで
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    name: 'Pro',
    price: 4800,
    sitesLimit: 5,
    dailyCheckLimit: 20, // 1日20回まで
  },
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business',
    name: 'Business',
    price: 9800,
    sitesLimit: 20,
    dailyCheckLimit: -1, // 無制限
  },
};

// プランごとの日次チェック制限を取得
export function getDailyCheckLimit(plan: string): number {
  if (plan === 'business') return -1; // 無制限
  if (plan === 'pro') return STRIPE_PLANS.pro.dailyCheckLimit;
  return STRIPE_PLANS.free.dailyCheckLimit; // デフォルトはfree
}