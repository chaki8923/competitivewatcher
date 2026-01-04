-- プロフィールテーブルに通知設定を追加
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_slack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;

-- RLS ポリシーは既存のものが適用される

