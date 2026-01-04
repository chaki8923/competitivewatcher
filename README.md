# Competitive Watcher 🔍

> 競合サイトの変化を自動検知し、要約と次の施策まで提示するWebマーケ自動化SaaS

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 特徴

- **🔍 自動監視**: 毎日自動で競合サイトをチェック（JavaScriptレンダリング対応）
- **🤖 AI要約**: Gemini 2.0 FlashがWebサイトの変更内容を分析
- **💡 施策提案**: マーケティング意図を推測し、次に打つべき施策を提案
- **📧 即時通知**: メール・Slack通知で変更を見逃さない
- **💳 サブスク課金**: Stripeで簡単にマネタイズ

---

## 🚀 クイックスタート

```bash
# 1. リポジトリをクローン
git clone https://github.com/yourusername/competitive-watcher.git
cd competitive-watcher

# 2. 依存関係をインストール
npm install

# 3. 環境変数を設定
cp .env.local.example .env.local
# .env.localを編集して各APIキーを設定

# 4. 開発サーバーを起動
npm run dev
```

詳細は [SETUP.md](./SETUP.md) を参照してください。

---

## 📚 ドキュメント

- **[SETUP.md](./SETUP.md)** - ローカル開発環境のセットアップ
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 本番環境へのデプロイ手順
- **[scripts/setup-cron.md](./scripts/setup-cron.md)** - Cron設定の詳細

---

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **Frontend** | Next.js 14 (App Router), React, TailwindCSS |
| **Backend** | Next.js API Routes, Supabase |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **AI** | Google Gemini 2.0 Flash |
| **Scraping** | Playwright |
| **Payment** | Stripe |
| **Hosting** | Vercel |
| **Cron** | GitHub Actions / Supabase Edge Functions |

---

## 📊 データベース構造

```
profiles
├─ id (uuid)
├─ plan (text: 'free' | 'pro' | 'business')
├─ stripe_customer_id
├─ notification_email
└─ slack_webhook_url

monitored_sites
├─ id (uuid)
├─ user_id (uuid)
├─ url (text)
├─ name (text)
├─ last_checked_at (timestamp)
└─ is_active (boolean)

site_snapshots
├─ id (uuid)
├─ site_id (uuid)
├─ html_content (text)
└─ created_at (timestamp)

site_changes
├─ id (uuid)
├─ site_id (uuid)
├─ diff_summary (jsonb)
├─ ai_summary (text)
├─ ai_intent (text)
├─ ai_suggestions (text)
└─ importance ('high' | 'medium' | 'low')
```

---

## 💰 料金プラン

| プラン | 価格 | 監視サイト数 | チェック頻度 |
|-------|------|-------------|-------------|
| **Free** | ¥0 | 1サイト | 週1回 |
| **Pro** | ¥8,900/月 | 5サイト | 毎日 |
| **Business** | ¥19,900/月 | 20サイト | 毎日 |

---

## 🎨 スクリーンショット

### ランディングページ
![Landing Page](docs/screenshots/landing.png)

### ダッシュボード
![Dashboard](docs/screenshots/dashboard.png)

### 変更検知結果
![Change Detection](docs/screenshots/change-detail.png)

---

## 🧪 開発ガイドライン

### MVPの方針

- ✅ **最小限の機能**: 課金に直結する機能のみ実装
- ✅ **動作優先**: 完璧なUIより動くものを優先
- ❌ **やらないこと**: SEO分析、SNS投稿、広告管理

### コミット規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加
chore: 雑務
```

---

## 📈 ロードマップ

- [x] MVP完成
- [ ] β版リリース
- [ ] 初期ユーザー獲得（10名）
- [ ] フィードバック収集
- [ ] 機能改善（優先度順）
- [ ] 本番リリース

---

## 🤝 コントリビューション

現在はMVP開発中のため、外部からのコントリビューションは受け付けていません。
正式リリース後に受け入れ予定です。

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照

---

## 📞 サポート

- **バグ報告**: [GitHub Issues](https://github.com/yourusername/competitive-watcher/issues)
- **機能要望**: [GitHub Discussions](https://github.com/yourusername/competitive-watcher/discussions)
- **メール**: support@competitivewatcher.com

---

## 🙏 謝辞

このプロジェクトは以下のOSSに支えられています：

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Playwright](https://playwright.dev/)
- [Stripe](https://stripe.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

Made with ❤️ by [Your Name](https://github.com/yourusername)

# competitivewatcher
