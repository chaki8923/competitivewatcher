import { createClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { plan } = body; // 'pro' or 'business'

    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json(
        { error: '有効なプランを選択してください' },
        { status: 400 }
      );
    }

    // プロフィールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Stripeカスタマーがない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: session.user.id,
        },
      });

      customerId = customer.id;

      // Supabaseに保存
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);
    }

    // Checkout Sessionを作成
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS].priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        user_id: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'エラーが発生しました' },
      { status: 500 }
    );
  }
}

