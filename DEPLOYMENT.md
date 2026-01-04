# デプロイガイド

## 📋 事前準備

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com/)にアクセス
2. 新規プロジェクトを作成
3. `supabase/schema.sql`をSQL Editorで実行
4. `supabase/migrations/001_add_notification_settings.sql`も実行

### 2. Gemini APIキー取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)でAPIキーを作成
2. 後で環境変数に設定

### 3. Stripe設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. Products → Create Product で2つのプランを作成:
   - **Pro**: ¥8,900/月
   - **Business**: ¥19,900/月
3. 各プランのPrice IDをコピー
4. Webhookを設定（デプロイ後）

---

## 🚀 Vercelへデプロイ

### 1. GitHubリポジトリにpush

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Vercelでインポート

1. [Vercel](https://vercel.com/)にログイン
2. "New Project" → GitHubリポジトリを選択
3. 以下の環境変数を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (後で設定)
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxx

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron（オプション）
CRON_SECRET=your_random_secret_string
```

4. "Deploy" をクリック

### 3. Stripe Webhookを設定

1. Stripe Dashboard → Developers → Webhooks
2. "Add endpoint" をクリック
3. URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Webhook Signing Secretをコピーして`STRIPE_WEBHOOK_SECRET`に設定
6. Vercelで環境変数を更新して再デプロイ

---

## ⏰ Cron設定（毎日自動チェック）

### 方法1: GitHub Actions（推奨・無料）

1. GitHubリポジトリ → Settings → Secrets → New repository secret
2. 以下を追加:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_FUNCTION_URL` (例: `https://xxxxx.supabase.co/functions/v1`)

3. `.github/workflows/cron.yml`は既に作成済み
4. pushすれば自動で毎日9時（JST）に実行される

### 方法2: Supabase Edge Functions

`scripts/setup-cron.md`を参照

---

## ✅ デプロイ後の確認

### 1. 動作確認

- [ ] ランディングページが表示される
- [ ] サインアップ・ログインができる
- [ ] サイト登録ができる
- [ ] 手動チェック（"今すぐチェック"）が動作する
- [ ] Stripe決済フローが動作する

### 2. Cron動作確認

```bash
# GitHub Actionsの場合
curl -X POST https://your-app.vercel.app/api/cron/daily-check \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. 通知テスト

- [ ] メール通知が届く（現在はコンソールログのみ）
- [ ] Slack通知が届く（Webhook URL設定後）

---

## 📈 本番運用のチェックリスト

- [ ] Supabase AuthのEmail確認を有効化
- [ ] Stripeを本番モードに切り替え
- [ ] メール送信サービス統合（Resend推奨）
- [ ] エラー監視ツール導入（Sentry等）
- [ ] バックアップ設定
- [ ] 利用規約・プライバシーポリシー追加
- [ ] ドメイン設定
- [ ] SSL証明書確認

---

## 💰 コスト見積もり

- **Supabase**: Free〜 (500MB DB, 2GB transfer)
- **Vercel**: Free〜 (Hobby: $0, Pro: $20/月)
- **Gemini API**: Free〜 (60 requests/min)
- **Stripe**: 3.6% + ¥0/件
- **GitHub Actions**: Free (2,000分/月)

**合計**: 初期は無料、ユーザー増加後も月$20程度で運用可能

---

## 🐛 トラブルシューティング

### Playwrightがタイムアウトする

→ サイトが重い可能性。`lib/scraper.ts`のタイムアウトを60秒に延長

### Stripe決済が失敗する

→ Webhook URLとSecretが正しいか確認

### Cronが動かない

→ GitHub Actionsのログを確認（Actions タブ）

---

## 📞 サポート

問題が解決しない場合は、以下を確認:

1. Vercel Logs
2. Supabase Logs
3. Browser Console
4. Network Tab

それでも解決しない場合は、エラーログと共にIssueを作成してください。

