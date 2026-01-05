"""
HPB Price Analyzer - 分析APIエンドポイント
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, HttpUrl

from scraper import scrape_hpb_url, scrape_multiple_pages
from database import save_search_history, get_user_search_history, get_search_history_by_id, delete_search_history

router = APIRouter(prefix="/api", tags=["analysis"])


class AnalyzeRequest(BaseModel):
    """分析リクエスト"""
    url: HttpUrl
    max_pages: Optional[int] = 100  # デフォルトで100ページまで取得（実質制限なし）


class AnalyzeResponse(BaseModel):
    """分析レスポンス"""
    history_id: str
    salon_count: int
    salons: list[dict]


class HistoryItem(BaseModel):
    """履歴アイテム"""
    id: str
    created_at: str
    target_url: str
    title: Optional[str] = ""
    salon_count: int


def get_user_id_from_header(authorization: Optional[str]) -> str:
    """
    Authorizationヘッダーからユーザーを識別
    注意: 本番環境ではSupabase JWTを検証する必要があります
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="認証が必要です")
    
    # TODO: Supabase JWT の検証を実装
    # 現時点では、ヘッダーからuser_idを直接受け取る簡易実装
    # 本番環境ではJWTをデコードしてuser_idを取得
    return authorization.replace("Bearer ", "")


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_url(
    request: AnalyzeRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    HPB URLを分析してサロンデータを取得・保存
    
    Args:
        request: 分析リクエスト（URL, max_pages）
        x_user_id: ユーザーID（ヘッダーから）
    
    Returns:
        保存された履歴IDとサロンデータ
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id ヘッダーが必要です")
    
    try:
        url_str = str(request.url)
        
        # HPBのURLかチェック
        if "hotpepper.jp" not in url_str:
            raise HTTPException(
                status_code=400,
                detail="ホットペッパービューティーのURLを入力してください"
            )
        
        # スクレイピング実行（複数ページ対応）
        max_pages = request.max_pages or 100
        salons, title = scrape_multiple_pages(url_str, max_pages)
        
        if not salons:
            raise HTTPException(
                status_code=404,
                detail="サロンデータを取得できませんでした。URLを確認してください"
            )
        
        # データベースに保存
        print(f"DEBUG: Saving history for {url_str} with title: '{title}'")
        saved = save_search_history(
            user_id=x_user_id,
            target_url=url_str,
            raw_data=salons,
            title=title
        )
        
        return AnalyzeResponse(
            history_id=saved["id"],
            salon_count=len(salons),
            salons=salons
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"サーバーエラー: {str(e)}")


@router.get("/history")
async def get_history(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    limit: int = 20
) -> list[HistoryItem]:
    """
    ユーザーの検索履歴を取得
    
    Args:
        x_user_id: ユーザーID
        limit: 取得件数上限
        
    Returns:
        検索履歴リスト
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id ヘッダーが必要です")
    
    try:
        histories = get_user_search_history(x_user_id, limit)
        
        return [
            HistoryItem(
                id=h["id"],
                created_at=h["created_at"],
                target_url=h["target_url"],
                title=h.get("title") or "",
                salon_count=len(h.get("raw_data", []))
            )
            for h in histories
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"履歴の取得に失敗しました: {str(e)}")


@router.get("/history/{history_id}")
async def get_history_detail(
    history_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> dict:
    """
    特定の検索履歴の詳細を取得
    
    Args:
        history_id: 履歴ID
        x_user_id: ユーザーID
        
    Returns:
        検索履歴の詳細データ
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id ヘッダーが必要です")
    
    try:
        history = get_search_history_by_id(history_id, x_user_id)
        
        if not history:
            raise HTTPException(status_code=404, detail="履歴が見つかりません")
        
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"履歴の取得に失敗しました: {str(e)}")


@router.delete("/history/{history_id}")
async def delete_history(
    history_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> dict:
    """
    特定の検索履歴を削除
    
    Args:
        history_id: 履歴ID
        x_user_id: ユーザーID
        
    Returns:
        成功ステータス
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id ヘッダーが必要です")
    
    try:
        deleted = delete_search_history(history_id, x_user_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail="履歴が見つからないか、削除権限がありません")
        
        return {"status": "success", "message": "履歴を削除しました"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"履歴の削除に失敗しました: {str(e)}")
