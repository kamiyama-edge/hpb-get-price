"""
スクレイピングロジックのユニットテスト
"""

import pytest
from scraper import extract_number, extract_review_count, parse_salon_card, SalonData
from bs4 import BeautifulSoup


class TestExtractNumber:
    """数値抽出のテスト"""
    
    def test_price_with_yen_symbol(self):
        """¥記号付き価格から数値を抽出"""
        assert extract_number("¥5,500") == 5500
    
    def test_price_with_en_suffix(self):
        """円サフィックス付き価格から数値を抽出"""
        assert extract_number("5500円") == 5500
    
    def test_price_with_comma(self):
        """カンマ区切り価格から数値を抽出"""
        assert extract_number("10,000") == 10000
    
    def test_price_with_fullwidth_yen(self):
        """全角円記号から数値を抽出"""
        assert extract_number("￥3,300") == 3300
    
    def test_empty_string(self):
        """空文字列はNoneを返す"""
        assert extract_number("") is None
    
    def test_none_input(self):
        """NoneはNoneを返す"""
        assert extract_number(None) is None
    
    def test_no_number(self):
        """数値がない文字列はNoneを返す"""
        assert extract_number("価格未定") is None


class TestExtractReviewCount:
    """口コミ数抽出のテスト"""
    
    def test_review_count_with_suffix(self):
        """「件」サフィックス付きから数値を抽出"""
        assert extract_review_count("口コミ123件") == 123
    
    def test_review_count_only_number(self):
        """数値のみ"""
        assert extract_review_count("45") == 45
    
    def test_no_review(self):
        """数値がない場合は0を返す"""
        assert extract_review_count("口コミなし") == 0
    
    def test_empty_string(self):
        """空文字列は0を返す"""
        assert extract_review_count("") == 0


class TestParseSalonCard:
    """サロンカードパースのテスト"""
    
    def test_parse_complete_card(self):
        """完全なサロンカードをパース"""
        html = """
        <div class="slnCassette">
            <h3><a class="slnName">テストサロン</a></h3>
            <span class="reviewNum">口コミ50件</span>
            <span class="couponPrice">¥5,000</span>
            <span class="couponPrice">¥7,000</span>
        </div>
        """
        soup = BeautifulSoup(html, 'lxml')
        card = soup.select_one('.slnCassette')
        
        result = parse_salon_card(card)
        
        assert result is not None
        assert result.name == "テストサロン"
        assert result.review_count == 50
        assert result.prices == [5000, 7000]
        assert result.average_price == 6000.0
    
    def test_parse_card_without_prices(self):
        """価格情報がないカードをパース"""
        html = """
        <div class="slnCassette">
            <h3><a class="slnName">サロン名のみ</a></h3>
            <span class="reviewNum">10件</span>
        </div>
        """
        soup = BeautifulSoup(html, 'lxml')
        card = soup.select_one('.slnCassette')
        
        result = parse_salon_card(card)
        
        assert result is not None
        assert result.name == "サロン名のみ"
        assert result.review_count == 10
        assert result.prices == []
        assert result.average_price is None
    
    def test_parse_card_without_name(self):
        """サロン名がないカードはNoneを返す"""
        html = """
        <div class="slnCassette">
            <span class="reviewNum">10件</span>
            <span class="couponPrice">¥5,000</span>
        </div>
        """
        soup = BeautifulSoup(html, 'lxml')
        card = soup.select_one('.slnCassette')
        
        result = parse_salon_card(card)
        
        assert result is None


class TestSalonDataToDict:
    """SalonData.to_dict()のテスト"""
    
    def test_to_dict(self):
        """辞書変換"""
        salon = SalonData(
            name="テスト",
            review_count=10,
            prices=[5000, 6000],
            average_price=5500.0
        )
        
        result = salon.to_dict()
        
        assert result == {
            "name": "テスト",
            "review_count": 10,
            "prices": [5000, 6000],
            "average_price": 5500.0
        }
