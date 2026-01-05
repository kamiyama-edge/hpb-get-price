"""
HPB Price Analyzer - Supabaseデータベース連携モジュール
"""

import os
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# 環境変数を読み込み
load_dotenv()

# Supabaseクライアントのシングルトン
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Supabaseクライアントを取得（シングルトン）"""
    global _supabase_client
    
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL と SUPABASE_KEY を環境変数に設定してください")
        
        _supabase_client = create_client(url, key)
    
    return _supabase_client


def save_search_history(
    user_id: str,
    target_url: str,
    raw_data: list[dict],
    title: str = ""
) -> dict:
    """
    検索履歴をSupabaseに保存
    
    Args:
        user_id: ユーザーID（Supabase Auth）
        target_url: スクレイピング対象URL
        raw_data: スクレイピング結果（サロンリスト）
        title: ページタイトル
        
    Returns:
        挿入されたレコード
    """
    client = get_supabase_client()
    
    data = {
        "user_id": user_id,
        "target_url": target_url,
        "raw_data": raw_data,
        "title": title
    }
    
    result = client.table("search_history").insert(data).execute()
    print(f"DEBUG: Insert result: {result.data}")
    
    if result.data:
        return result.data[0]
    raise ValueError("データの保存に失敗しました")


def get_all_search_history(limit: int = 20) -> list[dict]:
    """
    全ての検索履歴を取得（共有表示用）
    
    Args:
        limit: 取得件数上限
        
    Returns:
        検索履歴のリスト（新しい順）
    """
    client = get_supabase_client()
    
    result = (
        client.table("search_history")
        .select("id, created_at, target_url, raw_data, title")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    
    return result.data or []


def get_search_history_by_id(history_id: str) -> Optional[dict]:
    """
    特定の検索履歴を取得（全ユーザー共有）
    
    Args:
        history_id: 検索履歴ID
        
    Returns:
        検索履歴データ、見つからない場合はNone
    """
    client = get_supabase_client()
    
    result = (
        client.table("search_history")
        .select("*")
        .eq("id", history_id)
        .single()
        .execute()
    )
    
    return result.data


def delete_search_history(history_id: str, user_id: str) -> bool:
    """
    検索履歴を削除
    
    Args:
        history_id: 検索履歴ID
        user_id: ユーザーID（権限チェック用）
        
    Returns:
        成功した場合はTrue、それ以外はFalse
    """
    client = get_supabase_client()
    
    result = (
        client.table("search_history")
        .delete()
        .eq("id", history_id)
        .eq("user_id", user_id)
        .execute()
    )
    
    return len(result.data) > 0
