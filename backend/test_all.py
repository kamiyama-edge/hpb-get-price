from database import get_supabase_client
client = get_supabase_client()
res = client.table("search_history").select("user_id, id, title").order("created_at", desc=True).limit(5).execute()
print(res.data)
