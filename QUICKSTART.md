# ⚡ クイックスタートガイド

このガイドでは、**最短5分**でCompetitive Watcherのローカル開発環境を立ち上げる手順を説明します。

---

## 🎯 前提条件

以下がインストールされていることを確認してください:

- [Node.js](https://nodejs.org/) 18.0以上
- [npm](https://www.npmjs.com/) または [yarn](https://yarnpkg.com/)
- 現代的なブラウザ（Chrome, Firefox, Safari, Edge）

---

## 🚀 5分でスタート

### ステップ1: 依存関係のインストール（30秒）

```bash
cd /Users/chakiryou/Desktop/CompetitiveWatcher
npm install
```

### ステップ2: Supabaseプロジェクトの作成（2分）

1. **https://supabase.com/** にアクセスしてログイン
2. "New Project" をクリック
3. 以下を入力:
   - Name: `competitive-watcher`
   - Database Password: 強力なパスワード（保存しておく）
   - Region: `Northeast Asia (Tokyo)`
4. "Create new project" → 2分待機

### ステップ3: データベースのセットアップ（1分）

1. Supabase Dashboard → **SQL Editor**
2. "New query" をクリック
3. プロジェクトの `supabase/schema.sql` をコピー&ペースト
4. **"Run"** をクリック（緑のチェックマークが出ればOK）
5. 同様に `supabase/migrations/001_add_notification_settings.sql` も実行

### ステップ4: 認証設定（30秒）

⚠️ **超重要**: これをしないとログインできません！

1. Supabase Dashboard → **Authentication** → **Providers**
2. "Email" をクリック
3. **"Confirm email"** を **OFF** にする
4. "Save" をクリック

### ステップ5: APIキーを取得（30秒）

1. Supabase Dashboard → **Settings** → **API**
2. 以下をコピー:
   - Project URL
   - anon public key
   - service_role key（秘密！）

### ステップ6: Gemini APIキーを取得（30秒）

1. **https://makersuite.google.com/app/apikey** にアクセス
2. "Create API Key" をクリック
3. APIキーをコピー

### ステップ7: 環境変数を設定（1分）

プロジェクトルートに `.env.local` ファイルを作成:

```bash
# 最低限必要な設定（Stripe以外）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

💡 **ヒント**: `.env.local.example` をコピーして使用できます

### ステップ8: 開発サーバーを起動（5秒）

```bash
npm run dev
```

### ステップ9: ブラウザでアクセス

http://localhost:3000 を開く

---

## ✅ 動作確認（1分）

### 1. サインアップ

1. "無料で始める" をクリック
2. メールアドレスとパスワードを入力
3. "無料で始める" をクリック
4. **即座にダッシュボードに遷移する** ✅

もし遷移しない場合 → `TROUBLESHOOTING.md` を参照

### 2. サイト登録

1. "+ サイトを追加" をクリック
2. サイト名: `テストサイト`
3. URL: `https://example.com`
4. "追加" をクリック

### 3. 差分チェック（動作確認）

1. 登録したサイトの「...」メニューをクリック
2. "今すぐチェック" をクリック
3. 20-30秒待機（Playwrightがスクレイピング中）
4. **初回は「変更は検出されませんでした」**と表示される ✅

---

## 🎉 完了！

おめでとうございます！開発環境が立ち上がりました。

### 次のステップ

#### Stripeを設定（課金機能を使う場合）

詳細は `ENV_SETUP_GUIDE.md` の「Stripe」セクションを参照:

1. Stripeアカウント作成
2. 2つのプラン（Pro, Business）を作成
3. APIキーと Price IDを `.env.local` に追加

#### 本番環境にデプロイ

`DEPLOYMENT.md` を参照

---

## 🐛 トラブルシューティング

### 問題: サインアップ後にダッシュボードに遷移しない

**解決方法**: `TROUBLESHOOTING.md` を参照

簡単な確認:
1. Supabase → Authentication → Providers
2. Email の **"Confirm email"** が **OFF** になっているか確認

### 問題: "Invalid API key" エラー

**解決方法**:
1. `.env.local` のAPIキーが正しいか確認
2. 開発サーバーを再起動: `Ctrl+C` → `npm run dev`

### 問題: Playwrightエラー

```bash
npx playwright install chromium
```

---

## 📚 詳細ドキュメント

- **ENV_SETUP_GUIDE.md** - 環境変数の詳細な取得方法
- **SETUP.md** - 詳細なセットアップ手順
- **TROUBLESHOOTING.md** - トラブルシューティング
- **DEPLOYMENT.md** - 本番環境デプロイ
- **README.md** - プロジェクト概要

---

## 💡 開発のヒント

### 開発中に便利なコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルドテスト
npm run build

# 本番モードで起動
npm run start

# Lintチェック
npm run lint
```

### ブラウザの開発者ツール

`F12` または `Cmd+Option+I` (Mac) で開く

- **Console**: ログとエラーを確認
- **Network**: API通信を確認
- **Application**: ローカルストレージとCookieを確認

### Supabaseの便利機能

- **Table Editor**: データベースの内容を確認
- **Auth Users**: 登録ユーザー一覧
- **Logs**: エラーログを確認
- **API Docs**: 自動生成されたAPI仕様

---

## 🎯 最初に試すこと

### 1. テストサイトを登録

本番で監視したいサイトではなく、まずテスト用のURLで動作確認:

- `https://example.com`
- `https://httpbin.org/html`
- `https://www.google.com`

### 2. 差分検知をテスト

1. サイトを登録
2. "今すぐチェック" を実行（初回）
3. 20秒待機
4. もう一度 "今すぐチェック" を実行
5. "変更は検出されませんでした" と表示されれば成功 ✅

### 3. 通知設定をテスト

1. ダッシュボード → "設定"
2. Slack Webhook URLを設定（任意）
3. "保存" をクリック

---

## 🔐 セキュリティのベストプラクティス

### DO ✅

- `.env.local` を使う（Gitにコミットされない）
- 強力なパスワードを使用
- 開発中のみメール確認OFF

### DON'T ❌

- APIキーをコードに直接書かない
- `SUPABASE_SERVICE_ROLE_KEY` を公開しない
- テストデータを本番DBに入れない

---

## 📞 ヘルプ

わからないことがあれば:

1. このガイドを再確認
2. `TROUBLESHOOTING.md` を確認
3. ブラウザのコンソールでエラーを確認
4. Supabase Logsを確認

---

## 🎊 次のマイルストーン

- [ ] ローカル環境で動作確認完了
- [ ] Stripeを統合して課金フローをテスト
- [ ] 実際の競合サイトを登録してテスト
- [ ] 本番環境にデプロイ
- [ ] β版ユーザー募集

---

Happy Coding! 🚀

**所要時間**: 約5分
**難易度**: 初級
**前提知識**: なし（ガイドに従えばOK）
