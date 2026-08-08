import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// این کلاینت با service role key ساخته می‌شه و RLS رو دور می‌زنه.
// فقط توی server actions / route handlerهای پنل مدیریت استفاده بشه، هرگز توی کلاینت.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
