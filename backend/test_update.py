from database import get_supabase_client
client = get_supabase_client()
# Get the latest record ID
res = client.table("search_history").select("id").order("created_at", desc=True).limit(1).execute()
if res.data:
    row_id = res.data[0]['id']
    update_res = client.table("search_history").update({"title": "Manual Test Title"}).eq("id", row_id).execute()
    print(f"Update Result: {update_res.data}")
