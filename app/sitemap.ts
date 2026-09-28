import type { MetadataRoute } from "next";
import { getPublishedArticlesForSitemap } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-url";

// فقط URLهای عمومیِ قابل‌ایندکس: صفحات ثابت + هر مقاله‌ی منتشرشده. طبق سیاستِ
// این فاز، آرشیو تگ (noindex)، صفحات draft، و انواع query (جست‌وجو/دسته‌بندی)
// عمداً اینجا نیستن — این‌ها با robots متا در همون صفحات کنترل می‌شن.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await getPublishedArticlesForSitemap();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/articles`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/support`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${encodeURIComponent(article.slug)}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries];
}
