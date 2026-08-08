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
    readingMinutes: Math.max(1, Math.round(readingTime(row.content).minutes)),
    coverImageUrl: row.cover_image_url,
  };
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []).map(toMeta);
}

export async function getArticlesByCategory(category: string): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("category", category as ArticleCategory)
    .order("published_at", { ascending: false });
  return (data ?? []).map(toMeta);
}

export async function searchArticles(query: string): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order("published_at", { ascending: false });
  return (data ?? []).map(toMeta);
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

export async function getArchiveYears(): Promise<{ year: string; count: number }[]> {
  const articles = await getAllArticles();
  const counts = new Map<string, number>();
  articles.forEach((a) => {
    const year = new Date(a.publishedAt).toLocaleDateString("fa-IR-u-ca-persian", {
      year: "numeric",
    });
    counts.set(year, (counts.get(year) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([year, count]) => ({ year, count }));
}
