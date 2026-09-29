import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// وقتی کاربر روی لینک تأیید ایمیل (که Supabase می‌فرسته) کلیک می‌کنه، به اینجا می‌رسه.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  // فقط مسیرهای داخلیِ خودِ سایت («/...») مجازن، نه یک URL کامل یا
  // protocol-relative («//evil.com») — تا این پارامتر نتونه به open redirect تبدیل بشه.
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=لینک تأیید نامعتبر است`);
}
