import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 管理者がフィードバックを解決済みにする
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 管理者権限チェック
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (!admin) {
    return NextResponse.json(
      { error: 'この操作には管理者権限が必要です' },
      { status: 403 }
    );
  }

  const feedbackId = params.id;

  const { error } = await supabase
    .from('feedback')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: session.user.id,
    })
    .eq('id', feedbackId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
