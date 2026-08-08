"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// چون درگاه پرداخت واقعی هنوز وصل نیست، این صفحه راهیه که ادمین بعد از
// دریافت دستیِ پول (مثلاً کارت‌به‌کارت) دسترسی رو برای کاربر فعال کنه.
async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  const match = data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

export async function grantArticleAccess(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const articleId = String(formData.get("articleId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const currency = String(formData.get("currency") ?? "IRR");

  const userId = await findUserIdByEmail(email);
  if (!userId) {
    redirect(`/admin/access?error=${encodeURIComponent("کاربری با این ایمیل پیدا نشد")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("purchases")
    .upsert(
      { user_id: userId, article_id: articleId, amount, currency, status: "completed" },
      { onConflict: "user_id,article_id" }
    );

  if (error) {
    redirect(`/admin/access?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/access");
  redirect("/admin/access?message=" + encodeURIComponent("دسترسی مقاله فعال شد"));
}

export async function grantSubscription(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const plan = String(formData.get("plan") ?? "monthly") as "monthly" | "yearly";

  const userId = await findUserIdByEmail(email);
  if (!userId) {
    redirect(`/admin/access?error=${encodeURIComponent("کاربری با این ایمیل پیدا نشد")}`);
  }

  const periodEnd = new Date();
  if (plan === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
  else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    plan,
    status: "active",
    current_period_end: periodEnd.toISOString(),
  });

  if (error) {
    redirect(`/admin/access?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/access");
  redirect("/admin/access?message=" + encodeURIComponent("اشتراک فعال شد"));
}
