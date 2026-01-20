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
