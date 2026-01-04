import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Webhookはサービスロールキーを使用
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // イベント処理
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    throw new Error('Missing metadata');
  }

  // サブスクリプション情報を取得
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Supabaseを更新
  await supabase
    .from('profiles')
    .update({
      plan,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
    })
    .eq('id', userId);

  console.log(`Subscription created for user ${userId}: ${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // カスタマーIDからユーザーを検索
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('Profile not found for customer:', customerId);
    return;
  }

  // ステータスに応じて処理
  if (subscription.status === 'active') {
    // プランを更新（メタデータから取得）
    const plan = subscription.metadata?.plan || 'pro';
    
    await supabase
      .from('profiles')
      .update({
        plan,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', profile.id);
  }

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // カスタマーIDからユーザーを検索
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('Profile not found for customer:', customerId);
    return;
  }

  // Freeプランに戻す
  await supabase
    .from('profiles')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
    })
    .eq('id', profile.id);

  console.log(`Subscription deleted for user ${profile.id}`);
}

