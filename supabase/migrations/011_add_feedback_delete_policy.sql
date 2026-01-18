-- フィードバックの削除を管理者のみに許可するポリシーを追加
CREATE POLICY "Only admins can delete feedback" ON feedback FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admins));
