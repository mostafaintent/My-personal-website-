import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getArticlesByTag } from "@/lib/articles";
import { tagFromRouteParam } from "@/lib/tags";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

// همون تعداد در هر صفحه‌ی آرشیوِ اصلی (/articles)، برای یکسان‌ماندن convention.
const PER_PAGE = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = tagFromRouteParam(slug);
  const canonical = `${getSiteUrl()}/tags/${encodeURIComponent(tag)}`;

  return {
    title: `نوشته‌های برچسب «${tag}»`,
    alternates: { canonical },
    // آرشیو تگ برای کشف/ناوبریه، نه صفحه‌ی فرودِ سئو — طبق سیاستِ این فاز
    // همیشه noindex,follow (بدون آستانه‌ای مثل «اگر N مقاله داشت index کن»).
    robots: { index: false, follow: true },
  };
}

export default async function TagArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const tag = tagFromRouteParam(slug);
  if (!tag) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { articles, total, perPage } = await getArticlesByTag(tag, page, PER_PAGE);

  // تگ ناموجود یا تگی که فقط روی پیش‌نویس‌ها بوده (هیچ مقاله‌ی منتشرشده‌ای
  // نداره) → ۴۰۴. این با total (نه articles.length همین صفحه) چک می‌شه تا
  // صفحه‌ی خارج از بازه (مثلاً page=99) به‌جای ۴۰۴، مثل آرشیو اصلی خالی نشون داده بشه.
  if (total === 0) notFound();

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_4fr]">
        <div className="hidden min-w-0 sm:block">
          <Sidebar />
        </div>
        <div className="sm:pl-[1.5cm]">
          <h1 className="mb-10 text-3xl font-bold">نوشته‌های برچسب «{tag}»</h1>
          {articles.length > 0 ? (
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-muted">چیزی پیدا نشد.</p>
          )}
          <Pagination
            total={total}
            page={page}
            perPage={perPage}
            basePath={`/tags/${encodeURIComponent(tag)}`}
          />
        </div>
      </div>
    </Container>
  );
}
