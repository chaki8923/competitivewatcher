import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// いいねの切り替え
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

  const feedbackId = params.id;

  // 既にいいね済みか確認
  const { data: existingLike } = await supabase
    .from('feedback_likes')
    .select('id')
    .eq('feedback_id', feedbackId)
    .eq('user_id', session.user.id)
    .single();

  if (existingLike) {
    // いいねを削除
    const { error } = await supabase
      .from('feedback_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liked: false });
  } else {
    // いいねを追加
    const { error } = await supabase
      .from('feedback_likes')
      .insert({
        feedback_id: feedbackId,
        user_id: session.user.id,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liked: true });
  }
}
