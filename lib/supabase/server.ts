import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

// یک کلاینت جدید توی هر درخواست می‌سازیم (به‌جای singleton) چون کوکی‌های
// هر کاربر با کاربر دیگه فرق داره؛ این همون الگوی توصیه‌شده‌ی @supabase/ssr است.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // از یک Server Component صدا زده شده؛ middleware سشن رو تازه نگه می‌داره.
          }
        },
      },
    }
  );
}
