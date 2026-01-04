import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * サイトの変更履歴を取得
 */
export async function GET(
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

  // サイトの所有権確認
  const { data: site } = await supabase
    .from('monitored_sites')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (!site || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 変更履歴を取得
  const { data: changes, error } = await supabase
    .from('site_changes')
    .select('*')
    .eq('site_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ changes });
}

