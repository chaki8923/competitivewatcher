import { createClient } from '@/lib/supabase/server';
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
    const { notification_email, notification_slack, slack_webhook_url } = body;

    // 設定を更新
    const { error } = await supabase
      .from('profiles')
      .update({
        notification_email,
        notification_slack,
        slack_webhook_url,
      })
      .eq('id', session.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error.message || '保存に失敗しました' },
      { status: 500 }
    );
  }
}

