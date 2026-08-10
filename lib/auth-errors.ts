import type { AuthError } from "@supabase/supabase-js";

// پیام‌های خطای Supabase به‌صورت پیش‌فرض انگلیسی‌ان؛ این تابع رایج‌ترین‌هاشون
// رو به یه پیام فارسیِ قابل‌فهم برای کاربر ترجمه می‌کنه.
export function translateAuthError(error: AuthError): string {
  switch (error.code) {
    case "email_not_confirmed":
      return "ایمیل تایید نشده. لطفاً ایمیلی که با آن ثبت‌نام کرده‌اید را باز کنید و روی لینک تایید کلیک کنید تا ثبت‌نام تایید شود. بعد از تایید، به سایت برگردید و وارد شوید.";
    case "invalid_credentials":
      return "ایمیل یا رمز عبور اشتباه است.";
    case "user_already_exists":
      return "حسابی با این ایمیل قبلاً ثبت‌نام کرده است.";
    case "weak_password":
      return "رمز عبور خیلی ساده است. رمز قوی‌تری انتخاب کنید.";
    default:
      return error.message;
  }
}
