import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트 (service role key는 절대 클라이언트로 노출하지 않음)
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const THUMBNAIL_BUCKET = "thumbnails";
