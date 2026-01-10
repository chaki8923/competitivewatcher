import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * デバッグ用: チェック履歴の確認
 * 開発環境専用
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ユーザーのサイト一覧
    const { data: sites, error: sitesError } = await supabase
      .from('monitored_sites')
      .select('id, name')
      .eq('user_id', session.user.id);

    if (sitesError) throw sitesError;

    // チェック履歴
    const { data: history, error: historyError } = await supabase
      .from('site_check_history')
      .select('*')
      .in('site_id', sites?.map(s => s.id) || [])
      .order('checked_at', { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    // テーブルの存在確認
    const { error: tableError } = await supabase
      .from('site_check_history')
      .select('count')
      .limit(1);

    return NextResponse.json({
      tableExists: !tableError,
      tableError: tableError?.message,
      sitesCount: sites?.length || 0,
      sites: sites,
      historyCount: history?.length || 0,
      history: history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}
