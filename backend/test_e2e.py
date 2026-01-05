import asyncio
from routers.analysis import analyze_url, AnalyzeRequest
from pydantic import HttpUrl

async def test():
    req = AnalyzeRequest(url=HttpUrl("https://beauty.hotpepper.jp/genre/kgkw094/stc0030020/"), max_pages=1)
    # Mock Header X-User-Id
    user_id = '9d573747-10ea-4cd9-bc32-5a77d05d592e'
    res = await analyze_url(req, x_user_id=user_id)
    print(f"Analysis saved: {res.history_id}")
    
    from database import get_search_history_by_id
    detail = get_search_history_by_id(res.history_id, user_id)
    print(f"Stored Detail Title: '{detail.get('title')}'")

if __name__ == "__main__":
    asyncio.run(test())
