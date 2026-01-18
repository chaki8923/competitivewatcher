import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 管理者かどうかを確認
  const { data: adminData } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (!adminData) {
    return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
  }

  const feedbackId = params.id;

  try {
    // フィードバックを削除
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      console.error('❌ フィードバック削除エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    console.error('❌ フィードバック削除APIエラー:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete feedback' }, { status: 500 });
  }
}
