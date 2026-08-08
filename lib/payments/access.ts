import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/articles";

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
