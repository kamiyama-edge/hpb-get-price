"""
FastAPI エンドポイントのテスト
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from httpx import AsyncClient

# main.py からアプリをインポート
import sys
sys.path.insert(0, '..')
from main import app


client = TestClient(app)


class TestHealthEndpoints:
    """ヘルスチェックエンドポイントのテスト"""
    
    def test_root_endpoint(self):
        """ルートエンドポイントが正常に応答"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "message" in data
    
    def test_health_endpoint(self):
        """ヘルスチェックエンドポイントが正常に応答"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAnalyzeEndpoint:
    """分析エンドポイントのテスト"""
    
    def test_analyze_without_user_id(self):
        """X-User-Idヘッダーがない場合は401"""
        response = client.post(
            "/api/analyze",
            json={"url": "https://beauty.hotpepper.jp/test"}
        )
        
        assert response.status_code == 401
        assert "X-User-Id" in response.json()["detail"]
    
    def test_analyze_invalid_url(self):
        """HPB以外のURLは400エラー"""
        response = client.post(
            "/api/analyze",
            json={"url": "https://example.com"},
            headers={"X-User-Id": "test-user-id"}
        )
        
        assert response.status_code == 400
        assert "ホットペッパービューティー" in response.json()["detail"]
    
    @patch('routers.analysis.scrape_hpb_url')
    @patch('routers.analysis.save_search_history')
    def test_analyze_success(self, mock_save, mock_scrape):
        """正常なスクレイピング・保存フロー"""
        # モックの設定
        mock_scrape.return_value = [
            {
                "name": "テストサロン",
                "review_count": 10,
                "prices": [5000],
                "average_price": 5000.0
            }
        ]
        mock_save.return_value = {
            "id": "test-history-id",
            "user_id": "test-user-id",
            "target_url": "https://beauty.hotpepper.jp/test",
            "raw_data": mock_scrape.return_value
        }
        
        response = client.post(
            "/api/analyze",
            json={"url": "https://beauty.hotpepper.jp/test"},
            headers={"X-User-Id": "test-user-id"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["history_id"] == "test-history-id"
        assert data["salon_count"] == 1
        assert len(data["salons"]) == 1
    
    @patch('routers.analysis.scrape_hpb_url')
    def test_analyze_no_results(self, mock_scrape):
        """スクレイピング結果が空の場合は404"""
        mock_scrape.return_value = []
        
        response = client.post(
            "/api/analyze",
            json={"url": "https://beauty.hotpepper.jp/test"},
            headers={"X-User-Id": "test-user-id"}
        )
        
        assert response.status_code == 404
        assert "取得できませんでした" in response.json()["detail"]


class TestHistoryEndpoints:
    """履歴エンドポイントのテスト"""
    
    def test_get_history_without_user_id(self):
        """X-User-Idヘッダーがない場合は401"""
        response = client.get("/api/history")
        
        assert response.status_code == 401
    
    @patch('routers.analysis.get_user_search_history')
    def test_get_history_success(self, mock_get_history):
        """履歴取得成功"""
        mock_get_history.return_value = [
            {
                "id": "history-1",
                "created_at": "2026-01-01T00:00:00Z",
                "target_url": "https://beauty.hotpepper.jp/test",
                "raw_data": [{"name": "サロン1"}]
            }
        ]
        
        response = client.get(
            "/api/history",
            headers={"X-User-Id": "test-user-id"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "history-1"
    
    def test_get_history_detail_without_user_id(self):
        """履歴詳細取得にX-User-Idが必要"""
        response = client.get("/api/history/some-id")
        
        assert response.status_code == 401
    
    @patch('routers.analysis.get_search_history_by_id')
    def test_get_history_detail_not_found(self, mock_get_by_id):
        """存在しない履歴は404"""
        mock_get_by_id.return_value = None
        
        response = client.get(
            "/api/history/nonexistent-id",
            headers={"X-User-Id": "test-user-id"}
        )
        
        assert response.status_code == 404
