# HPB Price Analyzer

ホットペッパービューティー（HPB）から競合他社の価格・口コミデータを取得し、
自社の市場ポジションを可視化・分析するための社内用ツール。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Recharts |
| Backend | Python (FastAPI), Beautiful Soup 4 |
| Database/Auth | Supabase (PostgreSQL, Supabase Auth) |

## プロジェクト構成

```
hpb-get-price/
├── backend/           # Python FastAPI バックエンド
│   ├── main.py        # エントリポイント
│   ├── scraper.py     # スクレイピングロジック
│   ├── database.py    # Supabase連携
│   └── routers/       # APIルーター
├── frontend/          # Next.js フロントエンド
│   └── src/
│       ├── app/       # ページコンポーネント
│       ├── components/ # UIコンポーネント
│       └── lib/       # ユーティリティ
└── supabase/          # Supabase設定
    └── schema.sql     # テーブル定義
```

## セットアップ

### 1. Supabase設定

1. [Supabase](https://supabase.com) でプロジェクト作成
2. `supabase/schema.sql` をSQL Editorで実行
3. Authentication > Providers > Google を有効化
4. Site URL と Redirect URLs を設定

### 2. バックエンド

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 環境変数を設定
copy .env.example .env
# .env を編集して SUPABASE_URL, SUPABASE_KEY を設定

# 起動
python main.py
```

### 3. フロントエンド

```bash
cd frontend

# 環境変数を設定（.env.local として作成）
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm install
npm run dev
```

## 機能

- **Google OAuth認証**: @edge-i.jp ドメイン限定
- **価格スクレイピング**: HPB検索結果からサロンデータ抽出
- **散布図分析**: 口コミ数 vs 平均価格の可視化
- **履歴管理**: 過去の検索結果を保存・参照

## デプロイ

### フロントエンド (Vercel)

```bash
cd frontend
vercel
```

### バックエンド (Render)

1. Render で新規 Web Service 作成
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
