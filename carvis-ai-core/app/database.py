from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    url = settings.supabase_url
    key = settings.supabase_key
    supabase: Client = create_client(url, key)
    return supabase

db = get_supabase_client()
