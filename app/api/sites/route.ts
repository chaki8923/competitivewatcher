import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sites, error } = await supabase
    .from('monitored_sites')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sites })
}

export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { url, name } = body

  // バリデーション
  if (!url || !name) {
    return NextResponse.json(
      { error: 'URLとサイト名は必須です' },
      { status: 400 }
    )
  }

  // URL形式チェック
  try {
    new URL(url)
  } catch {
    return NextResponse.json(
      { error: '有効なURLを入力してください' },
      { status: 400 }
    )
  }

  // プラン制限チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .single()

  const { data: existingSites, error: countError } = await supabase
    .from('monitored_sites')
    .select('id')
    .eq('user_id', session.user.id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const planLimits: Record<string, number> = {
    free: 1,
    pro: 5,
    business: 20,
  }

  const currentPlan = profile?.plan || 'free'
  const limit = planLimits[currentPlan]

  if (existingSites && existingSites.length >= limit) {
    return NextResponse.json(
      { error: `${currentPlan}プランでは${limit}サイトまでしか登録できません` },
      { status: 403 }
    )
  }

  // サイト登録
  const { data: site, error } = await supabase
    .from('monitored_sites')
    .insert({
      user_id: session.user.id,
      url,
      name,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ site }, { status: 201 })
}

