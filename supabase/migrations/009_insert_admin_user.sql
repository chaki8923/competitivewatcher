-- 管理者ユーザーを追加（konkuriitonouenokare128@gmail.com）
INSERT INTO admins (user_id, email)
SELECT id, email
FROM auth.users
WHERE email = 'konkuriitonouenokareha128@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 確認用コメント
COMMENT ON TABLE admins IS '管理者テーブル - konkuriitonouenokare128@gmail.com が初期管理者として登録されました';
