import Link from "next/link";
import { ArticleMeta } from "@/lib/articles";
import { formatJalaliDate } from "@/lib/format";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import PremiumBadge from "./PremiumBadge";

export default function ArticleCard({
  article,
  authorName,
}: {
  article: ArticleMeta;
  authorName?: string;
}) {
  return (
    <Link href={`/articles/${encodeURIComponent(article.slug)}`} className="group block">
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt=""
          className="mb-4 aspect-video w-full rounded-lg object-cover"
        />
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <time>{formatJalaliDate(article.publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} دقیقه مطالعه</span>
        <span aria-hidden>·</span>
        <span>{article.category}</span>
        {article.premium && <PremiumBadge />}
      </div>
      <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h2>
      {authorName && <p className="mt-1 text-sm text-muted">{authorName}</p>}
      {article.excerpt && (
        <div
          className="mt-3 leading-8 text-muted"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.excerpt) }}
        />
      )}
    </Link>
  );
}
