import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { url, name, is_active } = body

  // 所有権確認
  const { data: site } = await supabase
    .from('monitored_sites')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!site || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 更新
  const updateData: any = {}
  if (url !== undefined) updateData.url = url
  if (name !== undefined) updateData.name = name
  if (is_active !== undefined) updateData.is_active = is_active

  const { data: updatedSite, error } = await supabase
    .from('monitored_sites')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ site: updatedSite })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 所有権確認
  const { data: site } = await supabase
    .from('monitored_sites')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!site || site.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 削除
  const { error } = await supabase
    .from('monitored_sites')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

