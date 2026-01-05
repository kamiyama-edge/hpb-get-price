"""
HPB Price Analyzer - スクレイピングモジュール
ホットペッパービューティーからサロン情報を抽出
"""

import re
from typing import Optional
from dataclasses import dataclass, asdict
import requests
from bs4 import BeautifulSoup


@dataclass
class SalonData:
    """サロンデータを格納するデータクラス"""
    name: str
    url: str
    blog_count: int
    review_count: int
    coupon_prices: list[int]  # 最大3つのクーポン価格
    min_price: Optional[int]
    max_price: Optional[int]
    average_price: Optional[float]
    
    def to_dict(self) -> dict:
        return asdict(self)


def extract_number(text: str) -> Optional[int]:
    """テキストから数値を抽出"""
    if not text:
        return None
    cleaned = re.sub(r'[¥￥円,、\s]', '', text)
    match = re.search(r'\d+', cleaned)
    return int(match.group()) if match else None


def scrape_hpb_url(url: str) -> tuple[list[dict], str, bool]:
    """
    HPB検索結果ページからサロン情報をスクレイピング
    
    Returns:
        (サロンリスト, ページタイトル, 次ページがあるか)
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
    except requests.RequestException as e:
        raise ValueError(f"URLの取得に失敗しました: {e}")
    
    soup = BeautifulSoup(response.text, 'lxml')
    
    # ページタイトルの抽出
    title_elem = soup.title.string if soup.title else ""
    title = str(title_elem).replace("｜ホットペッパービューティー", "").strip()
    
    # 次ページがあるかチェック: .iS.arrowPagingR
    has_next = soup.select_one('.iS.arrowPagingR') is not None
    
    salons = []
    
    # メインセレクタ: li.searchListCassette
    salon_cards = soup.select('li.searchListCassette')
    
    print(f"Found {len(salon_cards)} salon cards")
    
    for card in salon_cards:
        try:
            salon_data = parse_salon_card(card)
            if salon_data and salon_data.name:
                salons.append(salon_data.to_dict())
        except Exception as e:
            print(f"Parse error: {e}")
            continue
    
    return salons, title, has_next


def parse_salon_card(card: BeautifulSoup) -> Optional[SalonData]:
    """
    サロンカードをパースしてSalonDataを生成
    """
    # サロン名とURLの抽出: h3.slcHead a
    name_elem = card.select_one('h3.slcHead a')
    if not name_elem:
        # フォールバック
        name_elem = card.select_one('h3 a')
    
    if not name_elem:
        return None
    
    name = name_elem.get_text(strip=True)
    salon_url = name_elem.get('href', '')
    
    # URLを絶対パスに
    if salon_url and not salon_url.startswith('http'):
        salon_url = f"https://beauty.hotpepper.jp{salon_url}"
    
    if not name or len(name) < 2:
        return None
    
    # ブログ件数の抽出: dt.slcDetailBlogIcon の次の dd 内の a
    blog_count = 0
    blog_dt = card.select_one('dt.slcDetailBlogIcon')
    if blog_dt:
        blog_dd = blog_dt.find_next_sibling('dd')
        if blog_dd:
            blog_a = blog_dd.select_one('a')
            if blog_a:
                blog_text = blog_a.get_text(strip=True)
                blog_num = extract_number(blog_text)
                if blog_num:
                    blog_count = blog_num
    
    # 口コミ件数の抽出: dt.slcDetailMessageIcon の次の dd 内の a
    review_count = 0
    review_dt = card.select_one('dt.slcDetailMessageIcon')
    if review_dt:
        review_dd = review_dt.find_next_sibling('dd')
        if review_dd:
            review_a = review_dd.select_one('a')
            if review_a:
                review_text = review_a.get_text(strip=True)
                review_num = extract_number(review_text)
                if review_num:
                    review_count = review_num
    
    # クーポン価格の抽出: .slcCouponPrice
    coupon_prices = []
    price_elems = card.select('.slcCouponPrice')
    for elem in price_elems:
        price_text = elem.get_text(strip=True)
        price = extract_number(price_text)
        if price and 500 <= price <= 100000:
            coupon_prices.append(price)
    
    # 最大3つに制限
    coupon_prices = coupon_prices[:3]
    
    # 最小・最大・平均価格を算出
    min_price = min(coupon_prices) if coupon_prices else None
    max_price = max(coupon_prices) if coupon_prices else None
    average_price = sum(coupon_prices) / len(coupon_prices) if coupon_prices else None
    
    return SalonData(
        name=name,
        url=salon_url,
        blog_count=blog_count,
        review_count=review_count,
        coupon_prices=coupon_prices,
        min_price=min_price,
        max_price=max_price,
        average_price=round(average_price, 0) if average_price else None
    )


def scrape_multiple_pages(base_url: str, max_pages: int = 50) -> tuple[list[dict], str]:
    """複数ページをスクレイピング（ページネーション対応）"""
    all_salons = []
    seen_names = set()
    first_page_title = ""
    
    for page in range(1, max_pages + 1):
        # HPBのページネーションパラメータ: /PN{page}/
        if 'PN' in base_url:
            page_url = re.sub(r'PN\d+', f'PN{page}', base_url)
        elif page == 1:
            page_url = base_url
        else:
            # 末尾のスラッシュを考慮して /PN{page}/ を付与
            base_url_clean = base_url.split('?')[0]
            query_string = f"?{base_url.split('?')[1]}" if '?' in base_url else ""
            
            if not base_url_clean.endswith('/'):
                base_url_clean += '/'
            
            page_url = f"{base_url_clean}PN{page}/{query_string}"
        
        print(f"Fetching page {page}: {page_url}")
        
        try:
            salons, title, has_next = scrape_hpb_url(page_url)
            if page == 1:
                first_page_title = title
            
            if not salons:
                break
            
            for salon in salons:
                if salon['name'] not in seen_names:
                    seen_names.add(salon['name'])
                    all_salons.append(salon)
            
            # 次のページがない場合は終了
            if not has_next:
                print(f"Reached last page at {page}")
                break
                
        except Exception as e:
            print(f"Page {page} error: {e}")
            break
    
    return all_salons, first_page_title


if __name__ == "__main__":
    test_url = "https://beauty.hotpepper.jp/genre/kgkw094/pre47/city20500000/"
    try:
        results = scrape_hpb_url(test_url)
        print(f"取得サロン数: {len(results)}")
        for salon in results[:5]:
            print(f"  {salon['name']}: ブログ{salon['blog_count']}件, 口コミ{salon['review_count']}件, 価格{salon['coupon_prices']}, 平均{salon['average_price']}")
    except Exception as e:
        print(f"エラー: {e}")
