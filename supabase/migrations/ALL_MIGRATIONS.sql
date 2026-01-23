-- ============================================================================
-- 全マイグレーションファイルの統合版
-- ============================================================================
-- このファイルは、すべてのマイグレーションを順番にまとめたものです。
-- 新規データベースのセットアップ時に、このファイルを実行することで
-- すべてのマイグレーションを一度に適用できます。
-- ============================================================================

-- ============================================================================
-- 001_add_notification_settings.sql
-- プロフィールテーブルに通知設定を追加
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_slack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;

-- RLS ポリシーは既存のものが適用される


-- ============================================================================
-- 002_create_check_history.sql
-- チェック履歴テーブル（変更あり・なし両方を記録）
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_check_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES monitored_sites(id) ON DELETE CASCADE NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- チェック結果
  has_changes BOOLEAN NOT NULL,
  check_duration_ms INTEGER, -- チェック時間（ミリ秒）
  
  -- 変更がある場合の情報
  change_id UUID REFERENCES site_changes(id) ON DELETE SET NULL,
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
  changes_count INTEGER DEFAULT 0,
  
  -- AI要約（変更がある場合のみ）
  ai_summary TEXT,
  ai_intent TEXT,
  
  -- スクリーンショット（Cloudflare R2のURL）
  screenshot_url TEXT,
  screenshot_before_url TEXT,
  
  -- エラー情報
  has_error BOOLEAN DEFAULT false,
  error_message TEXT,
  
  -- インデックス用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_check_history_site_id ON site_check_history(site_id);
CREATE INDEX IF NOT EXISTS idx_check_history_checked_at ON site_check_history(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_check_history_has_changes ON site_check_history(has_changes);

-- RLS ポリシー
ALTER TABLE site_check_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサイトの履歴のみ閲覧可能
CREATE POLICY "Users can view check history of own sites"
  ON site_check_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM monitored_sites
      WHERE monitored_sites.id = site_check_history.site_id
      AND monitored_sites.user_id = auth.uid()
    )
  );

-- ユーザーは自分のサイトの履歴を作成可能
CREATE POLICY "Users can insert check history for own sites"
  ON site_check_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM monitored_sites
      WHERE monitored_sites.id = site_check_history.site_id
      AND monitored_sites.user_id = auth.uid()
    )
  );

-- 統計用のビュー（オプション）
CREATE OR REPLACE VIEW site_check_stats AS
SELECT 
  site_id,
  COUNT(*) as total_checks,
  COUNT(*) FILTER (WHERE has_changes = true) as changes_detected,
  COUNT(*) FILTER (WHERE has_error = true) as errors,
  AVG(check_duration_ms) as avg_duration_ms,
  MAX(checked_at) as last_checked_at
FROM site_check_history
GROUP BY site_id;


-- ============================================================================
-- 003_remove_change_percentage.sql
-- change_percentage カラムを削除
-- ============================================================================

ALTER TABLE site_check_history DROP COLUMN IF EXISTS change_percentage;


-- ============================================================================
-- 004_add_screenshot_columns.sql
-- スクリーンショットURLカラムを追加（存在しない場合のみ）
-- ============================================================================

-- screenshot_url カラムを追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_check_history' 
        AND column_name = 'screenshot_url'
    ) THEN
        ALTER TABLE site_check_history ADD COLUMN screenshot_url TEXT;
    END IF;
END $$;

-- screenshot_before_url カラムを追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_check_history' 
        AND column_name = 'screenshot_before_url'
    ) THEN
        ALTER TABLE site_check_history ADD COLUMN screenshot_before_url TEXT;
    END IF;
END $$;


-- ============================================================================
-- 005_add_ai_suggestions.sql
-- ai_suggestions カラムを追加（推奨施策を履歴に保存）
-- ============================================================================

ALTER TABLE site_check_history ADD COLUMN IF NOT EXISTS ai_suggestions TEXT;


-- ============================================================================
-- 006_add_compared_snapshot_date.sql
-- 比較対象のスナップショットの日時を保存するカラムを追加
-- ============================================================================

ALTER TABLE site_check_history 
ADD COLUMN IF NOT EXISTS compared_snapshot_created_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN site_check_history.compared_snapshot_created_at IS '比較対象として使用されたスナップショットの作成日時（日付指定チェックの場合）';


-- ============================================================================
-- 007_add_daily_check_limit.sql
-- プロフィールに日次チェック回数を追加
-- ============================================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_check_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_date DATE DEFAULT CURRENT_DATE;

COMMENT ON COLUMN profiles.daily_check_count IS '今日実行したチェック回数';
COMMENT ON COLUMN profiles.last_check_date IS '最後にチェックを実行した日付（日付が変わったらリセット）';

-- インデックス追加（日付でのクエリ最適化）
CREATE INDEX IF NOT EXISTS idx_profiles_last_check_date ON profiles(last_check_date);


-- ============================================================================
-- 008_create_feedback_system.sql
-- フィードバック・要望システム
-- ============================================================================

-- 管理者テーブル
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 管理者の初期データ（開発者）
INSERT INTO admins (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'konkuriitonouenokare128@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- フィードバック・要望テーブル
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS feedback_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback_resolved', 'feedback_liked')),
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_likes_feedback_id ON feedback_likes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_likes_user_id ON feedback_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- RLS ポリシー

-- admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Only admins can insert admins" ON admins FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create feedback" ON feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM admins));

-- feedback_likes
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON feedback_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON feedback_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own" ON feedback_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- トリガー: いいねカウントの更新
CREATE OR REPLACE FUNCTION update_feedback_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback SET likes_count = likes_count + 1 WHERE id = NEW.feedback_id;
    
    -- 投稿者に通知（自分自身のいいねは除外）
    INSERT INTO notifications (user_id, type, feedback_id)
    SELECT f.user_id, 'feedback_liked', NEW.feedback_id
    FROM feedback f
    WHERE f.id = NEW.feedback_id AND f.user_id != NEW.user_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback SET likes_count = likes_count - 1 WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_likes_count
AFTER INSERT OR DELETE ON feedback_likes
FOR EACH ROW EXECUTE FUNCTION update_feedback_likes_count();

-- トリガー: 解決済み通知
CREATE OR REPLACE FUNCTION notify_feedback_resolved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    INSERT INTO notifications (user_id, type, feedback_id)
    VALUES (NEW.user_id, 'feedback_resolved', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_feedback_resolved
AFTER UPDATE ON feedback
FOR EACH ROW EXECUTE FUNCTION notify_feedback_resolved();


-- ============================================================================
-- 009_insert_admin_user.sql
-- 管理者ユーザーを追加
-- ============================================================================

INSERT INTO admins (user_id, email)
SELECT id, email
FROM auth.users
WHERE email = 'konkuriitonouenokareha128@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 確認用コメント
COMMENT ON TABLE admins IS '管理者テーブル - konkuriitonouenokare128@gmail.com が初期管理者として登録されました';


-- ============================================================================
-- 010_fix_feedback_triggers.sql
-- フィードバックトリガー関数を修正
-- ============================================================================

-- いいねカウント更新トリガー関数を修正
CREATE OR REPLACE FUNCTION update_feedback_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- いいねカウントを増やす
    UPDATE feedback SET likes_count = likes_count + 1 WHERE id = NEW.feedback_id;
    
    -- 投稿者に通知（自分自身のいいねは除外）
    INSERT INTO notifications (user_id, type, feedback_id, is_read)
    SELECT f.user_id, 'feedback_liked', NEW.feedback_id, false
    FROM feedback f
    WHERE f.id = NEW.feedback_id AND f.user_id != NEW.user_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- いいねカウントを減らす
    UPDATE feedback SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 解決済み通知トリガー関数を修正
CREATE OR REPLACE FUNCTION notify_feedback_resolved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved') THEN
    INSERT INTO notifications (user_id, type, feedback_id, is_read)
    VALUES (NEW.user_id, 'feedback_resolved', NEW.id, false);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 011_add_feedback_delete_policy.sql
-- フィードバックの削除を管理者のみに許可
-- ============================================================================

CREATE POLICY "Only admins can delete feedback" ON feedback FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admins));


-- ============================================================================
-- 012_add_history_delete_policy.sql
-- site_check_historyの削除を許可するRLSポリシーを追加
-- ============================================================================

CREATE POLICY "Users can delete their own site check history" ON site_check_history FOR DELETE
USING (
  site_id IN (
    SELECT id FROM monitored_sites WHERE user_id = auth.uid()
  )
);


-- ============================================================================
-- マイグレーション完了
-- ============================================================================
-- すべてのマイグレーションが正常に適用されました。
-- ============================================================================
