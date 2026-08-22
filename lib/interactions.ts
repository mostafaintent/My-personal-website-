import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ArticleRef {
  slug: string;
  title: string;
}

// تعداد لایکِ یک مقاله، برای همه (حتی مهمان) — از تابع SECURITY DEFINER
// دیتابیس می‌خونه که فقط COUNT برمی‌گردونه، نه این‌که کی لایک کرده.
export async function getArticleLikeCount(articleId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_article_like_count", { p_article_id: articleId });
  return data ?? 0;
}

// وضعیت لایک/علاقه‌مندیِ کاربرِ لاگین‌کرده‌ی فعلی برای یک مقاله؛ برای
// نمایش درست وضعیت اولیه‌ی دکمه‌ها موقع رندر صفحه.
export async function getUserArticleFlags(
  userId: string,
  articleId: string
): Promise<{ liked: boolean; favorited: boolean }> {
  const supabase = await createClient();
  const [{ data: like }, { data: favorite }] = await Promise.all([
    supabase
      .from("article_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .maybeSingle(),
    supabase
      .from("article_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .maybeSingle(),
  ]);
  return { liked: Boolean(like), favorited: Boolean(favorite) };
}

// ثبت بازدید کاربرِ لاگین‌کرده از یک مقاله (برای «اخیراً دیده‌شده»).
// این تابع با کلاینتِ ادمین (بدون کوکی) کار می‌کنه چون قراره از داخلِ
// after() صدا زده بشه — و after() داخل Server Component اجازه‌ی
// استفاده از cookies()/headers() رو نمی‌ده. userId قبل از فراخوانی after
// (در زمان رندر) خونده شده، پس نیازی به کوکی اینجا نیست.
export async function logArticleView(userId: string, articleId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("article_views")
    .upsert(
      { user_id: userId, article_id: articleId, last_viewed_at: new Date().toISOString() },
      { onConflict: "user_id,article_id" }
    );
}

async function joinedArticles<T extends { article: ArticleRef | ArticleRef[] | null }>(
  rows: T[] | null
): Promise<(T & { article: ArticleRef })[]> {
  return (rows ?? [])
    .map((row) => ({ ...row, article: Array.isArray(row.article) ? row.article[0] : row.article }))
    .filter((row): row is T & { article: ArticleRef } => Boolean(row.article));
}

export async function getFavoriteArticles(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_favorites")
    .select("id, created_at, article:articles(slug, title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return joinedArticles(
    data as unknown as { id: string; created_at: string; article: ArticleRef | null }[] | null
  );
}

export async function getLikedArticles(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_likes")
    .select("id, created_at, article:articles(slug, title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return joinedArticles(
    data as unknown as { id: string; created_at: string; article: ArticleRef | null }[] | null
  );
}

export async function getRecentlyViewedArticles(userId: string, limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_views")
    .select("id, last_viewed_at, article:articles(slug, title)")
    .eq("user_id", userId)
    .order("last_viewed_at", { ascending: false })
    .limit(limit);
  return joinedArticles(
    data as unknown as { id: string; last_viewed_at: string; article: ArticleRef | null }[] | null
  );
}

export async function getReadArticles(userId: string, limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_reads")
    .select("id, read_at, article:articles(slug, title)")
    .eq("user_id", userId)
    .order("read_at", { ascending: false })
    .limit(limit);
  return joinedArticles(
    data as unknown as { id: string; read_at: string; article: ArticleRef | null }[] | null
  );
}
