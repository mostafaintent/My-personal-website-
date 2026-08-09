import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatJalaliDate } from "@/lib/format";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import PremiumBadge from "./PremiumBadge";
import PaywallGate from "./PaywallGate";
import Tag from "./Tag";

export default function ArticleFullCard({
  article,
  authorName,
  unlocked,
  isLoggedIn,
}: {
  article: Article;
  authorName?: string;
  unlocked: boolean;
  isLoggedIn: boolean;
}) {
  return (
    <article className="border-b border-border py-10 first:pt-0 last:border-b-0">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <time>{formatJalaliDate(article.publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} دقیقه مطالعه</span>
        <span aria-hidden>·</span>
        <span>{article.category}</span>
        {article.premium && <PremiumBadge />}
      </div>

      <Link href={`/articles/${encodeURIComponent(article.slug)}`} className="group">
        <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
          {article.title}
        </h2>
      </Link>
      {authorName && <p className="mt-1 text-sm text-muted">{authorName}</p>}

      {unlocked ? (
        <div
          className="prose-article mt-4"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
        />
      ) : (
        <>
          {article.excerpt && <p className="mt-4 leading-8 text-muted">{article.excerpt}</p>}
          <PaywallGate priceIRR={article.priceIRR} priceUSD={article.priceUSD} isLoggedIn={isLoggedIn} />
        </>
      )}

      {article.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
