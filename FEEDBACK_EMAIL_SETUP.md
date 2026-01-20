# フィードバック機能 - メール送信設定

## 必要な環境変数

フィードバックが投稿されたときに開発者にメール通知を送るために、以下の環境変数を`.env.local`に追加してください。

### Resend（推奨）

```env
# Resend API Key（無料枠：月100通）
RESEND_API_KEY=re_xxxxxxxxxxxxx

# 開発者のメールアドレス（通知先）
DEVELOPER_EMAIL=konkuriitonouenokare128@gmail.com

# 送信元メールアドレス（Resendで認証済みのドメイン）
FROM_EMAIL=noreply@yourdomain.com
```

### Resend API Keyの取得方法

1. [Resend](https://resend.com/)にアクセス
2. アカウント作成（GitHubでサインアップ可能）
3. ダッシュボードで「API Keys」をクリック
4. 「Create API Key」をクリック
5. APIキーをコピーして`RESEND_API_KEY`に設定

### ドメイン認証（本番環境用）

開発環境では`onboarding@resend.dev`から送信できますが、本番では独自ドメインの認証が必要です：

1. Resendダッシュボードで「Domains」をクリック
2. 「Add Domain」で独自ドメインを追加
3. DNSレコード（TXT、MX、CNAME）を設定
4. 認証完了後、`FROM_EMAIL`を`noreply@yourdomain.com`に変更

## 代替案：SendGrid（無料枠：月100通）

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
DEVELOPER_EMAIL=konkuriitonouenokare128@gmail.com
FROM_EMAIL=noreply@yourdomain.com
```

## 代替案：Supabase Auth SMTP（既存設定を利用）

Supabaseプロジェクトで既にSMTPが設定されている場合、それを利用できます。

```env
# Supabase Auth SMTP設定を利用
USE_SUPABASE_SMTP=true
DEVELOPER_EMAIL=konkuriitonouenokare128@gmail.com
```

## インストール

```bash
npm install resend
```

または

```bash
npm install @sendgrid/mail
```

## 通知内容

フィードバックが投稿されると、以下の内容がメールで届きます：

- 投稿者のメールアドレス
- タイトル
- 詳細内容
- 投稿日時
- ダッシュボードへのリンク

---

**推奨**: Resendは開発者向けに最適化されており、セットアップが簡単です。
