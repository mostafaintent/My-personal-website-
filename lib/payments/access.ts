import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/articles";

// نسخه‌ی دسته‌ای hasAccess برای صفحه‌هایی که چندتا مقاله رو با هم نشون
// می‌دن (مثل فید صفحه‌ی اصلی) — به‌جای دو کوئری به‌ازای هر مقاله‌ی ویژه،
// کل وضعیت دسترسی رو با حداکثر دو کوئری برمی‌گردونه.
export async function getUnlockedMap(
  userId: string | null,
  articles: Article[]
): Promise<Record<string, boolean>> {
  const map: Record<string, boolean> = {};
  const premiumIds: string[] = [];

  articles.forEach((article) => {
    if (article.premium) premiumIds.push(article.id);
    else map[article.id] = true;
  });

  if (premiumIds.length === 0) return map;

  if (!userId) {
    premiumIds.forEach((id) => {
      map[id] = false;
    });
    return map;
  }

  const supabase = await createClient();
  const [{ data: purchases }, { data: subscription }] = await Promise.all([
    supabase
      .from("purchases")
      .select("article_id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .in("article_id", premiumIds),
    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("current_period_end", new Date().toISOString())
      .maybeSingle(),
  ]);

  const purchasedIds = new Set((purchases ?? []).map((p) => p.article_id));
  const hasActiveSubscription = Boolean(subscription);

  premiumIds.forEach((id) => {
    map[id] = hasActiveSubscription || purchasedIds.has(id);
  });

  return map;
}

export async function hasAccess(userId: string | null, article: Article): Promise<boolean> {
  if (!article.premium) return true;
  if (!userId) return false;

  const supabase = await createClient();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("article_id", article.id)
    .eq("status", "completed")
    .maybeSingle();
  if (purchase) return true;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .maybeSingle();

  return Boolean(subscription);
}
