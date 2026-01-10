import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * 開発環境専用: プランを手動で更新
 * 本番環境では削除すること
 */
export async function POST(request: Request) {
  // 開発環境のみ動作
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

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
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // プランを更新
    const { error } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `Plan updated to ${plan}`,
      userId: session.user.id 
    });
  } catch (error: any) {
    console.error('Test upgrade error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
