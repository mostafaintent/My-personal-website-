import ArticleCard from "./ArticleCard";
import type { ArticleMeta } from "@/lib/articles";

// اگر مطلب مرتبطِ معناداری پیدا نشد، اصلاً چیزی رندر نمی‌شه (نه یک بخش
// خالی) — ArticleCard دوباره استفاده شده تا با استایل/رفتار آرشیو یکی بمونه.
export default function RelatedArticles({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10 print:hidden">
      <h2 className="mb-8 text-center text-xl font-bold">مطالب مرتبط</h2>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
