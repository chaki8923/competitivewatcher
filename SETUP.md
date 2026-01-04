# セットアップガイド

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`を`.env.local`にコピー:

```bash
cp .env.local.example .env.local
```

以下の手順で各APIキーを取得して設定してください。

---

## 📝 環境変数の取得方法

### Supabase

1. [Supabase](https://supabase.com/)でアカウント作成
2. 新規プロジェクトを作成
3. Settings → API から以下をコピー:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. SQL Editorで以下を実行:
   - `supabase/schema.sql`（テーブル作成）
   - `supabase/migrations/001_add_notification_settings.sql`（通知設定）

### Gemini API

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. "Create API Key"をクリック
3. `GEMINI_API_KEY`にコピー

### Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. Developers → API keys から:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)
   - `STRIPE_SECRET_KEY` (Secret key)

3. Products → Create product で2つのプランを作成:
   - **Pro**: ¥8,900/月（月次課金）
   - **Business**: ¥19,900/月（月次課金）

4. 各プランのPrice IDをコピー:
   - `STRIPE_PRO_PRICE_ID`
   - `STRIPE_BUSINESS_PRICE_ID`

5. Webhookは開発中は不要（デプロイ後に設定）

---

## 🏃 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

---

## ✅ 動作確認チェックリスト

- [ ] トップページが表示される
- [ ] サインアップができる
- [ ] ログインができる
- [ ] ダッシュボードが表示される
- [ ] サイト登録ができる
- [ ] "今すぐチェック"で差分検知が動作する
- [ ] AI要約が表示される

---

## 🐛 よくある問題

### Supabase接続エラー

→ `.env.local`のURLとキーが正しいか確認

### Playwright起動エラー

```bash
npx playwright install chromium
```

### Gemini APIエラー

→ APIキーが有効か確認（無料枠の制限に注意）

---

## 📚 次のステップ

1. テスト用の競合サイトを登録
2. 手動チェックで動作確認
3. 通知設定でSlack連携をテスト
4. デプロイ準備（`DEPLOYMENT.md`参照）

---

## 🔗 関連ドキュメント

- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイ手順
- [README.md](./README.md) - プロジェクト概要
- [scripts/setup-cron.md](./scripts/setup-cron.md) - Cron設定詳細

