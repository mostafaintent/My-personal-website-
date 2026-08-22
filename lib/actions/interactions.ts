"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function toggleFavorite(articleId: string, articleSlug: string) {
  const current = await getCurrentUser();
  if (!current) {
    redirect(`/login?error=${encodeURIComponent("برای ذخیره‌ی مقاله باید وارد حساب شوید")}`);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("article_favorites")
    .select("id")
    .eq("user_id", current.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (existing) {
    await supabase.from("article_favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("article_favorites").insert({ user_id: current.id, article_id: articleId });
  }

  revalidatePath(`/articles/${articleSlug}`);
  revalidatePath("/account");
}

export async function toggleLike(articleId: string, articleSlug: string) {
  const current = await getCurrentUser();
  if (!current) {
    redirect(`/login?error=${encodeURIComponent("برای لایک باید وارد حساب شوید")}`);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("article_likes")
    .select("id")
    .eq("user_id", current.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (existing) {
    await supabase.from("article_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("article_likes").insert({ user_id: current.id, article_id: articleId });
  }

  revalidatePath(`/articles/${articleSlug}`);
  revalidatePath("/account");
}

// از داخل ReadTracker (کلاینت) صدا زده می‌شه؛ برای کاربر مهمان بی‌سروصدا
// کاری نمی‌کنه (نه ریدایرکت، نه خطا) چون این یک اکشن پس‌زمینه‌ست، نه کلیک کاربر.
export async function markArticleRead(articleId: string) {
  const current = await getCurrentUser();
  if (!current) return;

  const supabase = await createClient();
  await supabase
    .from("article_reads")
    .upsert(
      { user_id: current.id, article_id: articleId, read_at: new Date().toISOString() },
      { onConflict: "user_id,article_id" }
    );

  revalidatePath("/account");
}
