"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth-errors";

// از هدرهای درخواست (نه یک env متغیر جدید) origin سایت رو می‌سازیم تا لینک
// بازیابیِ رمز به همون دامنه‌ای برگرده که کاربر ازش درخواست داده — چه
// لوکال باشه چه دیپلوی‌شده.
async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || undefined } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(translateAuthError(error))}`);
  }

  redirect("/login?message=" + encodeURIComponent("ثبت‌نام انجام شد. حالا وارد شوید."));
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateAuthError(error))}`);
  }

  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const genericMessage =
    "اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی رمز عبور برایش ارسال شد.";

  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent("ایمیل را وارد کنید")}`);
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // نتیجه‌ی این فراخوانی عمداً نادیده گرفته می‌شه (چه خطا بده چه نه) و همیشه
  // همون پیام عمومی نشون داده می‌شه — تا از این مسیر نشه فهمید کدوم ایمیل‌ها
  // توی سایت حساب دارن (Supabase خودش هم برای همین دلیل این متد رو طوری
  // طراحی کرده که برای ایمیل ناموجود هم خطا برنمی‌گردونه).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  redirect(`/forgot-password?message=${encodeURIComponent(genericMessage)}`);
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    redirect(`/reset-password?error=${encodeURIComponent("رمز عبور باید حداقل ۶ کاراکتر باشد")}`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent("رمز عبور و تکرار آن یکسان نیستند")}`);
  }

  const supabase = await createClient();

  // updateUser فقط وقتی کار می‌کنه که کاربر یک نشست فعال داشته باشه — همون
  // نشستی که /auth/callback بعد از باز کردن لینک ایمیل بازیابی ساخته.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/reset-password?error=${encodeURIComponent(
        "لینک بازیابی نامعتبر یا منقضی شده. دوباره از صفحه‌ی فراموشی رمز درخواست بدهید."
      )}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(translateAuthError(error))}`);
  }

  await supabase.auth.signOut();
  redirect("/login?message=" + encodeURIComponent("رمز عبور تغییر کرد. حالا با رمز جدید وارد شوید."));
}
