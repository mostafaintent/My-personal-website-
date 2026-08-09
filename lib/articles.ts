import readingTime from "reading-time";
import { createClient } from "@/lib/supabase/server";
import type { ArticleCategory, ArticleRow } from "@/lib/types/database";

export const CATEGORIES: ArticleCategory[] = [
  "یادداشت",
  "ادبیات",
  "فلسفه",
  "روان‌شناسی",
  "تاریخ",
  "عرفان",
  "ترجمه",
];

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
    readingMinutes: Math.max(1, Math.round(readingTime(plainText).minutes)),
    coverImageUrl: row.cover_image_url,
  };
}

export interface PaginatedArticles {
  articles: ArticleMeta[];
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
    .eq("category", category as ArticleCategory)
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { articles: (data ?? []).map(toMeta), total: count ?? 0, page, perPage };
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
  return { ...toMeta(data), content: data.content };
}
