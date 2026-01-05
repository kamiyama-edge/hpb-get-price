-- ===========================================
-- HPB Price Analyzer - Supabase テーブル設定
-- ===========================================

-- search_history テーブル作成
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  raw_data JSONB NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- ===========================================
-- Row Level Security (RLS) 設定
-- ===========================================

-- RLSを有効化
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- 自分のデータのみ参照可能
CREATE POLICY "Users can view own history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

-- 自分のデータのみ挿入可能
CREATE POLICY "Users can insert own history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のデータのみ削除可能（オプション）
CREATE POLICY "Users can delete own history"
  ON search_history FOR DELETE
  USING (auth.uid() = user_id);


-- ===========================================
-- 認証設定のメモ（Supabase Dashboardで設定）
-- ===========================================

/*
1. Authentication > Providers > Google を有効化
   - Client ID と Client Secret を設定
   
2. Authentication > URL Configuration
   - Site URL: https://your-frontend-url.vercel.app
   - Redirect URLs: 
     - https://your-frontend-url.vercel.app/auth/callback
     - http://localhost:3000/auth/callback （開発用）

3. Google Cloud Console で OAuth 設定
   - Authorized redirect URIs に Supabase の callback URL を追加
     例: https://your-project.supabase.co/auth/v1/callback
*/
