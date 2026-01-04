# Cron設定ガイド

## 方法1: Supabase Edge Functions（推奨）

### 1. Edge Functionをデプロイ

```bash
# Supabase CLIをインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref YOUR_PROJECT_REF

# Functionをデプロイ
supabase functions deploy daily-check --no-verify-jwt
```

### 2. Supabase Dashboardでcron設定

1. Supabase Dashboard → Database → Extensions
2. `pg_cron`を有効化
3. SQL Editorで以下を実行:

```sql
-- 毎日午前9時（JST）に実行
SELECT cron.schedule(
  'daily-site-check',
  '0 0 * * *',  -- 00:00 UTC = 09:00 JST
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    )
  );
  $$
);
```

### 3. 環境変数を設定

Supabase Dashboard → Edge Functions → daily-check → Settings:

- `APP_URL`: Next.jsアプリのURL（例: https://your-app.vercel.app）
- `SUPABASE_URL`: 自動設定済み
- `SUPABASE_SERVICE_ROLE_KEY`: 自動設定済み

---

## 方法2: GitHub Actions（簡易版）

### 1. GitHubリポジトリのSecretsを設定

Settings → Secrets and variables → Actions:

- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `SUPABASE_FUNCTION_URL`: `https://YOUR_PROJECT_REF.supabase.co/functions/v1`

### 2. `.github/workflows/cron.yml`を確認

すでにファイルは作成済み。GitHubにpushすれば自動で動作します。

---

## 方法3: Vercel Cron（Vercel Proプラン限定）

`vercel.json`に追加:

```json
{
  "crons": [{
    "path": "/api/cron/daily-check",
    "schedule": "0 0 * * *"
  }]
}
```

そして`/api/cron/daily-check/route.ts`を作成してチェックロジックを実装。

---

## テスト実行

手動でEdge Functionを実行:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-check
```

---

## 監視とデバッグ

- Supabase Dashboard → Edge Functions → Logs
- GitHub Actions → Actions タブ
- Next.js → Vercel Logs

---

## 本番運用時の注意

1. **レート制限**: Playwrightは重い処理なので、同時実行数を制限（現在は1秒間隔）
2. **タイムアウト**: Edge Functionsは最大60秒。サイトが多い場合はバッチ処理に分割
3. **エラーハンドリング**: 失敗したサイトはリトライまたは管理者に通知
4. **コスト**: Playwrightは計算リソースを消費。プラン別に頻度を調整推奨

