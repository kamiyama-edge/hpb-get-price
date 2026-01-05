from database import get_user_search_history
histories = get_user_search_history('a06dee1a-6df4-43c3-b7a8-4612cb874f09', 5)
for h in histories:
    print(f"ID: {h['id']}, Title: {h.get('title')} ({type(h.get('title'))})")
