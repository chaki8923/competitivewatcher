// Supabase Edge Function - runs in Deno runtime
// Note: TypeScript errors for Deno imports are expected in IDE but won't affect runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabaseクライアント作成（サービスロールキー）
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // アクティブな監視サイトを取得
    const { data: sites, error } = await supabase
      .from('monitored_sites')
      .select(`
        id,
        url,
        name,
        user_id,
        profiles:user_id (
          notification_email,
          notification_slack,
          slack_webhook_url
        )
      `)
      .eq('is_active', true)

    if (error) {
      throw error
    }

    console.log(`Found ${sites?.length || 0} active sites to check`)

    // 各サイトをチェック（Next.jsのAPIを呼び出す）
    const results: Array<{
      siteId: string;
      siteName: string;
      success: boolean;
      hasChanges?: boolean;
      error?: string;
    }> = []
    for (const site of sites || []) {
      try {
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000'
        
        // Next.jsのチェックAPIを呼び出す
        // 本番では内部APIキーで認証を追加推奨
        const checkResponse = await fetch(`${appUrl}/api/sites/${site.id}/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'X-Internal-Key': Deno.env.get('INTERNAL_API_KEY') || '',
          },
        })

        const checkData = await checkResponse.json()
        
        results.push({
          siteId: site.id,
          siteName: site.name,
          success: checkResponse.ok,
          hasChanges: checkData.hasChanges || false,
        })

        console.log(`Checked ${site.name}: ${checkResponse.ok ? 'OK' : 'FAILED'}`)
        
        // レート制限対策（1秒待機）
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        console.error(`Error checking site ${site.name}:`, err)
        results.push({
          siteId: site.id,
          siteName: site.name,
          success: false,
          error: err.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkedCount: sites?.length || 0,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Daily check error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

