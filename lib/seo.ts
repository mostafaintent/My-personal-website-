import type { Metadata } from "next";

// این فایل فقط تابع‌های خالص برای ساختن metadata/JSON-LD مقاله‌هاست —
// بدون فراخوانی Supabase — تا بدون دیتابیس قابل تست باشن. هیچ مقدار
// جعلی/placeholder اینجا تولید نمی‌شه: هر فیلد فقط وقتی ست می‌شه که
// داده‌ی واقعی برایش موجود باشد.

export function buildArticleUrl(siteUrl: string, slug: string): string {
  return `${siteUrl}/articles/${encodeURIComponent(slug)}`;
}

export interface ArticleMetadataInput {
  title: string;
  descriptionText: string;
  siteUrl: string;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  authorName: string;
}

export function buildArticleMetadata(input: ArticleMetadataInput): Metadata {
  const url = buildArticleUrl(input.siteUrl, input.slug);
  const description = input.descriptionText || undefined;

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: input.title,
      description,
      url,
      publishedTime: input.publishedAt,
      authors: [input.authorName],
      images: input.coverImageUrl ? [{ url: input.coverImageUrl }] : undefined,
    },
  };
}

export interface ArticleJsonLdInput {
  title: string;
  slug: string;
  siteUrl: string;
  descriptionText?: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
}

export interface ArticleJsonLd {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description?: string;
  image?: string[];
  datePublished: string;
  dateModified: string;
  author: { "@type": "Person"; name: string };
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
  url: string;
}

export function buildArticleJsonLd(input: ArticleJsonLdInput): ArticleJsonLd {
  const url = buildArticleUrl(input.siteUrl, input.slug);

  const jsonLd: ArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { "@type": "Person", name: input.authorName },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  if (input.descriptionText) jsonLd.description = input.descriptionText;
  if (input.coverImageUrl) jsonLd.image = [input.coverImageUrl];

  return jsonLd;
}

// جلوگیری از شکستنِ اسکریپت با یک `</script>` داخل متن (مثلاً توی عنوان)؛
// escape کردن `<` برای این نوع تزریق کافی و استاندارده.
export function jsonLdToScriptString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// سیاست سئوی /articles: آرشیو خام (بدون پارامتر، یا فقط با page) مثل یک
// صفحه‌ی عادی ایندکس می‌شه، با canonical به خودش (شامل ?page=N اگر بود).
// حالت‌های جست‌وجو/دسته‌بندی («q» یا «category»، با هر ترکیب/صفحه‌ای) صفحه‌ی
// فرود مستقل نیستن — نه‌فقط noindex,follow، بلکه canonical هم به خودِ آرشیوِ
// خام (بدون querystring) اشاره می‌کنه، نه به خودشون؛ چون هدف اینه که این
// URLها اصلاً واریانت مستقلی برای سئو حساب نشن (نه فقط ایندکس نشن) — ساده‌ترین
// سیاستِ سازگار با این‌که آرشیو اصلی «همیشه» همون یک مقصد canonical رو داشته باشه.
export interface ArchiveQueryMetadataInput {
  siteUrl: string;
  basePath: string;
  q?: string;
  category?: string;
  page?: string;
}

export interface ArchiveQueryMetadataResult {
  canonical: string;
  isFilterVariant: boolean;
}

export function buildArchiveCanonicalAndRobots(
  input: ArchiveQueryMetadataInput
): ArchiveQueryMetadataResult {
  const isFilterVariant = Boolean(input.q || input.category);

  if (isFilterVariant) {
    return { canonical: `${input.siteUrl}${input.basePath}`, isFilterVariant: true };
  }

  const params = new URLSearchParams();
  if (input.page && input.page !== "1") params.set("page", input.page);
  const qs = params.toString();
  const canonical = `${input.siteUrl}${input.basePath}${qs ? `?${qs}` : ""}`;

  return { canonical, isFilterVariant: false };
}
