"""
HPB Price Analyzer - FastAPI メインエントリポイント
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.analysis import router as analysis_router

# 環境変数を読み込み
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時の処理
    print("🚀 HPB Price Analyzer API を起動しています...")
    yield
    # シャットダウン時の処理
    print("👋 HPB Price Analyzer API をシャットダウンしています...")


# FastAPIアプリケーションを作成
app = FastAPI(
    title="HPB Price Analyzer API",
    description="ホットペッパービューティーから価格データを取得・分析するAPI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS設定
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Vercelのプレビュー環境にも対応
if os.getenv("VERCEL_URL"):
    allowed_origins.append(f"https://{os.getenv('VERCEL_URL')}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(analysis_router)


@app.get("/")
async def root():
    """ルートエンドポイント（ヘルスチェック用）"""
    return {
        "message": "HPB Price Analyzer API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
