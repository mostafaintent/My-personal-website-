import ArticleCard from "./ArticleCard";
import type { ArticleMeta } from "@/lib/articles";

// اگر مطلب مرتبطِ معناداری پیدا نشد، اصلاً چیزی رندر نمی‌شه (نه یک بخش خالی).
// ArticleCard عمومی (همون آرشیو) عیناً reuse شده — بدون clamp سفارشی، بدون
// حذف دکمه — چون آن ظاهر از قبل درست بود؛ تنها تفاوت لازم همین‌جا بود:
// حداکثر ۲ ستون (نه ۳)، چون این بخش همیشه داخل ستون باریک (max-w-2xl)
// صفحه‌ی مقاله‌ست و ۳ ستون یعنی کارت‌های بیش‌ازحد باریک و کشیده. اگر ۳
// مطلب مرتبط باشه، کارت سوم طبق رفتار پیش‌فرض grid خودش می‌ره ردیف بعد،
// فقط توی یک ستون (نه stretch‌شده روی کل عرض).
export default function RelatedArticles({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10 print:hidden">
      <h2 className="mb-8 text-center text-xl font-bold">مطالب مرتبط</h2>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
