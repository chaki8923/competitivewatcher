import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendFeedbackNotification } from '@/lib/email';

// フィードバック一覧取得
export async function GET(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'open' or 'resolved'

  let query = supabase
    .from('feedback')
    .select(`
      *,
      feedback_likes(user_id)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: feedback, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 各フィードバックに現在のユーザーがいいねしているかを追加
  const feedbackWithLiked = feedback?.map((item) => ({
    ...item,
    liked_by_user: item.feedback_likes?.some((like: any) => like.user_id === session.user.id) || false,
  }));

  return NextResponse.json({ feedback: feedbackWithLiked });
}

// フィードバック投稿
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description } = await request.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: 'タイトルと内容は必須です' },
      { status: 400 }
    );
  }

  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert({
      user_id: session.user.id,
      title,
      description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 開発者にメール通知を送信
  await sendFeedbackNotification({
    title,
    description,
    userEmail: session.user.email || '不明',
    createdAt: feedback.created_at,
  });

  return NextResponse.json({ feedback });
}
