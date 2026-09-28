import readingTime from "reading-time";
import { createClient } from "@/lib/supabase/server";
import type { ArticleCategory, ArticleRow } from "@/lib/types/database";
import { rankRelatedCandidates } from "@/lib/related-articles";

export interface ArticleMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  tags: string[];
  premium: boolean;
  priceUSD?: number;
  priceIRR?: number;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  coverImageUrl?: string | null;
}

export interface Article extends ArticleMeta {
  content: string;
}

function toMeta(row: ArticleRow): ArticleMeta {
  const plainText = row.content.replace(/<[^>]*>/g, " ");
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags,
    premium: row.premium,
    priceUSD: row.price_usd ?? undefined,
    priceIRR: row.price_irr ?? undefined,
    publishedAt: row.published_at ?? row.created_at,
    updatedAt: row.updated_at,
    readingMinutes: Math.max(1, Math.round(readingTime(plainText).minutes)),
    coverImageUrl: row.cover_image_url,
  };
}

function toArticle(row: ArticleRow): Article {
  return { ...toMeta(row), content: row.content };
}

export interface PaginatedArticles {
  articles: ArticleMeta[];
  total: number;
  page: number;
  perPage: number;
}

export interface PaginatedFullArticles {
  articles: Article[];
  total: number;
  page: number;
  perPage: number;
}

export async function getAllArticles(page = 1, perPage = 5): Promise<PaginatedArticles> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { articles: (data ?? []).map(toMeta), total: count ?? 0, page, perPage };
}

export async function getAllArticlesFull(page = 1, perPage = 5): Promise<PaginatedFullArticles> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { articles: (data ?? []).map(toArticle), total: count ?? 0, page, perPage };
}

export async function getArticlesByCategory(
  category: string,
  page = 1,
  perPage = 5
): Promise<PaginatedArticles> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { articles: (data ?? []).map(toMeta), total: count ?? 0, page, perPage };
}

// تگ entity مستقل نداره (lib/tags.ts رو ببینید)، پس فیلتر روی خودِ ستون
// آرایه‌ای tags با عملگر containment انجام می‌شه — همون الگوی pagination/count
// سایر توابع بالا (getArticlesByCategory) عیناً تکرار شده.
export async function getArticlesByTag(
  tag: string,
  page = 1,
  perPage = 5
): Promise<PaginatedArticles> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .contains("tags", [tag])
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { articles: (data ?? []).map(toMeta), total: count ?? 0, page, perPage };
}

// برای sitemap فقط slug و تاریخ آخرین ویرایش لازمه؛ برخلاف بقیه‌ی توابع این
// فایل، عمداً content رو نمی‌خونیم (نه برای toMeta لازمه، نه برای sitemap).
export interface SitemapArticle {
  slug: string;
  updatedAt: string;
}

export async function getPublishedArticlesForSitemap(): Promise<SitemapArticle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []).map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
}

// کاندیدهای «مطالب مرتبط» با دو کوئریِ ساده (تگ مشترک + دسته‌ی مشترک) جمع
// می‌شن، دوباره‌شمرده‌ها با Map یکی می‌شن، و رتبه‌بندیِ واقعی توی
// rankRelatedCandidates (خالص، بدون وابستگی به Supabase) انجام می‌شه.
export async function getRelatedArticles(article: Article, limit = 3): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const CANDIDATE_CAP = 20;

  const queries = [
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .neq("id", article.id)
      .eq("category", article.category)
      .order("published_at", { ascending: false })
      .limit(CANDIDATE_CAP),
  ];

  if (article.tags.length > 0) {
    queries.push(
      supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .neq("id", article.id)
        .overlaps("tags", article.tags)
        .order("published_at", { ascending: false })
        .limit(CANDIDATE_CAP)
    );
  }

  const results = await Promise.all(queries);
  const byId = new Map<string, ArticleRow>();
  results.forEach(({ data }) => {
    (data ?? []).forEach((row) => byId.set(row.id, row as ArticleRow));
  });

  const candidates = Array.from(byId.values()).map((row) => ({
    id: row.id,
    category: row.category,
    tags: row.tags,
    publishedAt: row.published_at ?? row.created_at,
    row,
  }));

  const ranked = rankRelatedCandidates(
    { id: article.id, category: article.category, tags: article.tags },
    candidates,
    limit
  );

  return ranked.map(({ row }) => toMeta(row));
}

export async function searchArticles(
  query: string,
  page = 1,
  perPage = 5
): Promise<PaginatedArticles> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { articles: (data ?? []).map(toMeta), total: count ?? 0, page, perPage };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  return toArticle(data);
}
