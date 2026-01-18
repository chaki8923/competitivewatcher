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
