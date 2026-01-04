import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

/**
 * Stripe Customer Portalへのリンクを作成
 * （サブスクリプション管理・キャンセル用）
 */
export async function POST() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // プロフィールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Stripeカスタマーが見つかりません' },
        { status: 404 }
      );
    }

    // Portal Sessionを作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error.message || 'エラーが発生しました' },
      { status: 500 }
    );
  }
}

