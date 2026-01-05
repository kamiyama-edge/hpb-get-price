from database import get_supabase_client
client = get_supabase_client()
res = client.table("search_history").select("created_at, target_url, title").order("created_at", desc=True).limit(10).execute()
for row in res.data:
    print(f"{row['created_at']} | {row['target_url'][-20:]} | {row['title']}")
