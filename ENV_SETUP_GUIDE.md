# 🔐 環境変数設定ガイド

このガイドでは、Competitive Watcherの開発・本番環境で必要なすべての環境変数と、その取得方法を説明します。

---

## 📋 必要な環境変数一覧

```env
# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini AI（必須）
GEMINI_API_KEY=

# Stripe（必須 - 課金機能を使う場合）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=

# App URL（必須）
NEXT_PUBLIC_APP_URL=

# Cron認証（オプション - 本番環境推奨）
CRON_SECRET=
```

---

## 1️⃣ Supabase（データベース・認証）

### 📍 取得手順

1. **アカウント作成**
   - https://supabase.com/ にアクセス
   - "Start your project" をクリック
   - GitHubまたはメールでサインアップ

2. **新規プロジェクト作成**
   - "New Project" をクリック
   - プロジェクト名: `competitive-watcher`
   - データベースパスワード: 強力なパスワードを設定（保存しておく）
   - リージョン: `Northeast Asia (Tokyo)` または最寄りのリージョン
   - "Create new project" をクリック（2-3分待機）

3. **APIキーを取得**
   - 左サイドバー → ⚙️ Settings → API
   - 以下の値をコピー:

   ```env
   # Project URL
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   
   # Project API keys > anon public
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Project API keys > service_role (⚠️ 絶対に公開しない)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **データベースのセットアップ**
   - 左サイドバー → 🗄️ SQL Editor
   - "New query" をクリック
   - `supabase/schema.sql` の内容を全てコピー&ペースト
   - "Run" をクリック（緑のチェックマークが表示されればOK）
   - 同様に `supabase/migrations/001_add_notification_settings.sql` も実行

5. **認証設定（オプション）**
   - 左サイドバー → 🔐 Authentication → Providers
   - Email の "Enable Email provider" がONになっているか確認
   - "Confirm email" はOFFでOK（開発中は確認メール不要）

### ⚠️ 注意事項

- `SUPABASE_SERVICE_ROLE_KEY` は管理者権限を持つため、**絶対にGitにコミットしない**
- `.env.local` は `.gitignore` に含まれているため安全

---

## 2️⃣ Gemini AI（AI要約・施策提案）

### 📍 取得手順

1. **Google AI Studio にアクセス**
   - https://makersuite.google.com/app/apikey にアクセス
   - Googleアカウントでログイン

2. **APIキーを作成**
   - "Create API Key" をクリック
   - 既存のGoogle Cloud Projectを選択 or "Create API key in new project"
   - 生成されたAPIキーをコピー

   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **利用制限を確認**
   - 無料枠: 60 requests/分
   - 開発中は十分、本番でも初期は問題なし

### 💡 ヒント

- APIキーは再発行可能
- 課金を有効化すると制限が緩和されるが、初期は不要

---

## 3️⃣ Stripe（課金・サブスクリプション）

### 📍 取得手順

#### A. アカウント作成 & APIキー取得

1. **アカウント作成**
   - https://dashboard.stripe.com/register にアクセス
   - メールアドレスで登録
   - 国: 日本、業種: SaaS を選択

2. **テストモードで開発**
   - 右上の "テストモード" トグルがONになっているか確認
   - Developers → API keys にアクセス

3. **APIキーをコピー**
   ```env
   # Publishable key（公開キー - フロントエンドで使用）
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXXXXXXXXXXXXX
   
   # Secret key（秘密キー - サーバーサイドで使用）
   STRIPE_SECRET_KEY=sk_test_51XXXXXXXXXXXXXXXX
   ```

#### B. 商品（プラン）を作成

1. **Proプラン作成**
   - 左サイドバー → Product catalog → "Add product" をクリック
   - 商品情報:
     - Name: `Pro Plan`
     - Description: `5サイトまで監視可能、毎日チェック`
   - 料金設定:
     - Pricing model: `Standard pricing`
     - Price: `¥8,900`
     - Billing period: `Monthly`
   - "Save product" をクリック
   - **Price ID をコピー**（`price_xxxxxxxxxxxxx`）

   ```env
   STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
   ```

2. **Businessプラン作成**
   - 同様の手順で作成:
     - Name: `Business Plan`
     - Description: `20サイトまで監視可能、毎日チェック`
     - Price: `¥19,900`
     - Billing period: `Monthly`
   - **Price ID をコピー**

   ```env
   STRIPE_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxx
   ```

#### C. Webhook設定（デプロイ後に実施）

⚠️ **注意**: Webhookは本番環境にデプロイ後に設定します。開発中は不要です。

1. **Webhook作成（本番環境デプロイ後）**
   - Developers → Webhooks → "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events to send:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
   - "Add endpoint" をクリック

2. **Signing secretをコピー**
   - 作成したWebhookをクリック
   - "Signing secret" の "Reveal" をクリック
   - コピーして環境変数に追加

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### D. 本番モードへの切り替え（実際に課金する前）

1. **ビジネス情報を登録**
   - Settings → Business settings
   - 会社情報、銀行口座情報を入力

2. **本番モードに切り替え**
   - 右上のトグルを "本番モード" に変更
   - 本番用のAPIキーをコピーして環境変数を更新

   ```env
   # 本番用（pk_live_, sk_live_ で始まる）
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

### 💰 料金

- Stripeの利用料: **取引手数料 3.6%**
- 月額費用: なし
- 決済が発生するまで無料

---

## 4️⃣ App URL（アプリケーションのURL）

### 📍 設定方法

#### 開発環境

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 本番環境（Vercel等）

```env
# Vercelの場合
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# カスタムドメインの場合
NEXT_PUBLIC_APP_URL=https://competitivewatcher.com
```

### 📝 用途

- Stripe決済後のリダイレクトURL
- メール通知内のリンク
- OGP画像のURL生成

---

## 5️⃣ Cron認証（オプション）

### 📍 設定方法

自動監視のCronエンドポイントを保護するための秘密鍵です。

#### 生成方法

以下のコマンドで強力なランダム文字列を生成:

```bash
# macOS / Linux
openssl rand -base64 32

# 出力例
CRON_SECRET=XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234==
```

または、オンラインツール:
- https://randomkeygen.com/ の "CodeIgniter Encryption Keys" を使用

```env
CRON_SECRET=your_random_secret_string_here
```

### 📝 用途

- `/api/cron/daily-check` エンドポイントの認証
- 不正なアクセスを防ぐ

### 💡 開発中は設定不要

開発環境では未設定でも動作しますが、本番環境では**必ず設定**してください。

---

## 📁 ファイル構成

### 開発環境

`.env.local` を作成（このファイルはGitにコミットされない）:

```bash
cp .env.local.example .env.local
```

### 本番環境（Vercel）

Vercelの場合、環境変数は以下で設定:

1. Vercel Dashboard → プロジェクト選択
2. Settings → Environment Variables
3. すべての環境変数を追加
4. "Production", "Preview", "Development" を選択
5. "Save" をクリック

---

## ✅ 設定確認チェックリスト

開発を始める前に、以下を確認してください:

### 必須項目

- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が設定されている
- [ ] Supabaseでスキーマ（`schema.sql`）を実行した
- [ ] Supabaseでマイグレーション（`001_add_notification_settings.sql`）を実行した
- [ ] `GEMINI_API_KEY` が設定されている
- [ ] `NEXT_PUBLIC_APP_URL` が設定されている

### Stripe（課金機能を使う場合）

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` が設定されている
- [ ] `STRIPE_SECRET_KEY` が設定されている
- [ ] `STRIPE_PRO_PRICE_ID` が設定されている
- [ ] `STRIPE_BUSINESS_PRICE_ID` が設定されている
- [ ] Stripeで2つのプラン（Pro, Business）を作成した

### 本番環境のみ

- [ ] `STRIPE_WEBHOOK_SECRET` が設定されている
- [ ] `CRON_SECRET` が設定されている
- [ ] Stripe Webhookを設定した
- [ ] GitHub SecretsにCron用の変数を設定した

---

## 🧪 動作確認

環境変数の設定が完了したら、以下のコマンドで開発サーバーを起動:

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて動作確認:

1. トップページが表示される → ✅ 基本設定OK
2. サインアップできる → ✅ Supabase OK
3. サイト登録後に「今すぐチェック」が動作する → ✅ Gemini OK
4. プランアップグレードボタンを押すとStripe決済画面が開く → ✅ Stripe OK

---

## 🐛 トラブルシューティング

### Supabase接続エラー

```
Error: Invalid API key
```

**解決方法:**
- URLとキーが正しいか確認
- `.env.local` を保存した後、開発サーバーを再起動 (`Ctrl+C` → `npm run dev`)

### Gemini APIエラー

```
Error: API key not valid
```

**解決方法:**
- Google AI StudioでAPIキーを再確認
- 無料枠の制限（60 requests/分）に達していないか確認

### Stripe決済画面が開かない

```
Error: No such price
```

**解決方法:**
- `STRIPE_PRO_PRICE_ID` と `STRIPE_BUSINESS_PRICE_ID` が正しいか確認
- Price IDは `price_` で始まる必要がある（`prod_` ではない）
- Stripeダッシュボードで作成した商品のPricing情報からPrice IDをコピー

### 環境変数が読み込まれない

**解決方法:**
1. `.env.local` ファイルが正しい場所にあるか確認（プロジェクトルート）
2. ファイル名が正しいか確認（`.env.local` であって `.env` ではない）
3. 開発サーバーを再起動
4. `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` で確認

---

## 🔒 セキュリティのベストプラクティス

### DO ✅

- `.env.local` を使う（`.gitignore` に含まれている）
- `NEXT_PUBLIC_` プレフィックスは公開されても安全な値のみ
- 本番環境では必ず `CRON_SECRET` を設定
- `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しない

### DON'T ❌

- `.env` ファイルをGitにコミット
- APIキーをコード内にハードコーディング
- `SUPABASE_SERVICE_ROLE_KEY` をフロントエンドで使用
- テストモードのAPIキーを本番環境で使用

---

## 📞 サポート

環境変数の設定でわからないことがあれば:

1. このガイドの該当セクションを再確認
2. 各サービスの公式ドキュメントを参照
   - [Supabase Docs](https://supabase.com/docs)
   - [Gemini API Docs](https://ai.google.dev/docs)
   - [Stripe Docs](https://stripe.com/docs)
3. エラーメッセージをGoogle検索

---

## 🎉 完了！

すべての環境変数が設定できたら、開発を開始できます！

```bash
npm install
npm run dev
```

Happy Coding! 🚀

