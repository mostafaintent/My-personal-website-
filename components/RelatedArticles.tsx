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
          // خلاصه محتوای مهمیه؛ فقط جلوی طولانی‌شدنِ بی‌حدوحصر گرفته می‌شه
          // (حدود ۶ خط)، نه این‌که به چند کلمه‌ی بی‌معنا کوتاه بشه.
          // [&_*]:inline تگ‌های بلوکی احتمالی (مثل <p>) رو داخل همین متن
          // مسطح می‌کنه تا line-clamp روی کل متن یکسان عمل کنه، نه هر
          // پاراگراف جدا.
          className="line-clamp-6 mt-2 text-sm leading-7 text-muted [&_*]:inline"
          dangerouslySetInnerHTML={{ __html: sanitizeExcerptHtml(article.excerpt) }}
        />
      )}
    </Link>
  );
}

// اگر مطلب مرتبطِ معناداری پیدا نشد، اصلاً چیزی رندر نمی‌شه (نه یک بخش خالی).
// حداکثر همیشه ۲ ستون — هرگز ۳ ستون نه، چون این بخش همیشه داخل ستون باریک
// (max-w-2xl) صفحه‌ی مقاله‌ست و ۳ ستون یعنی کارت‌های بیش‌ازحد باریک. اگر ۳
// مطلب مرتبط باشه، کارت سوم طبق رفتار پیش‌فرض grid خودش می‌ره ردیف بعد،
// فقط توی یک ستون (نه stretch‌شده روی کل عرض).
export default function RelatedArticles({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10 print:hidden">
      <h2 className="mb-8 text-center text-xl font-bold">مطالب مرتبط</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <RelatedArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
