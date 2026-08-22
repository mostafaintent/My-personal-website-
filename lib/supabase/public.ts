import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// کلاینت ساده و بدون کوکی، فقط برای خوندن داده‌های عمومی (تنظیمات سایت،
// دسته‌بندی‌ها و...) که قراره کش بشن. برخلاف کلاینت معمولی سرور، به
// session/کوکیِ کاربر وابسته نیست؛ برای همین داخل unstable_cache قابل
// استفاده‌ست (Next.js اجازه نمی‌ده cookies() داخل تابع کش‌شده صدا زده بشه).
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
