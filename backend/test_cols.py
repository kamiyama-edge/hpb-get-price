from database import get_supabase_client
client = get_supabase_client()
# Try a raw SQL query to see columns or use the client to inspect
# Actually, just try to update a record.
res = client.table("search_history").select("*").limit(1).execute()
print(f"Columns in first row: {res.data[0].keys()}")
