import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles";
import { sanitizeExcerptHtml } from "@/lib/sanitize";
import PremiumBadge from "./PremiumBadge";

// یک کارت جمع‌وجور مخصوص همین بخش — عمداً ArticleCard عمومی (آرشیو) reuse
// نشده چون آنجا کارت‌ها تمام‌خلاصه و با دکمه‌ی «ادامه‌ی مطلب» طراحی شدن؛
// اینجا فضا محدودتره (داخل ستون باریک صفحه‌ی مقاله) و نیاز به ارتفاع
// یکنواخت و خلاصه‌ی کوتاه‌شده داریم، بدون اینکه ظاهر/رفتار ArticleCard
// در آرشیو دست بخوره.
function RelatedArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link
      href={`/articles/${encodeURIComponent(article.slug)}`}
      className="group flex h-full flex-col"
    >
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt=""
          className="mb-3 aspect-video w-full shrink-0 rounded-lg object-cover"
        />
      )}
      {article.premium && (
        <div className="mb-2">
          <PremiumBadge />
        </div>
      )}
      <h3 className="line-clamp-3 text-base font-semibold text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h3>
      {article.excerpt && (
        <div
          // [&_*]:inline تگ‌های بلوکی احتمالی (مثل <p>) رو داخل همین متن
          // مسطح می‌کنه تا line-clamp روی کل متن یکسان عمل کنه، نه هر
          // پاراگراف جدا.
          className="line-clamp-3 mt-2 text-sm leading-7 text-muted [&_*]:inline"
          dangerouslySetInnerHTML={{ __html: sanitizeExcerptHtml(article.excerpt) }}
        />
      )}
    </Link>
  );
}

// اگر مطلب مرتبطِ معناداری پیدا نشد، اصلاً چیزی رندر نمی‌شه (نه یک بخش خالی).
// grid با auto-fit/minmax عرض واقعیِ خودِ ستون محتوا رو مبنا قرار می‌ده (نه
// breakpoint‌های viewport) — چون این بخش همیشه داخل یک ستون باریک
// (max-w-2xl مقاله) قرار داره، حتی روی صفحه‌های عریض. همین باعث می‌شه
// روی موبایل واقعی خودکار یک‌ستونه بشه و جای اضافه هدر نره.
export default function RelatedArticles({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10 print:hidden">
      <h2 className="mb-8 text-center text-xl font-bold">مطالب مرتبط</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {articles.map((article) => (
          <RelatedArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
