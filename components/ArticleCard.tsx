import Link from "next/link";
import { ArticleMeta } from "@/lib/articles";
import { sanitizeExcerptHtml } from "@/lib/sanitize";
import PremiumBadge from "./PremiumBadge";

export default function ArticleCard({ article }: { article: ArticleMeta }) {
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
      {article.premium && (
        <div className="mb-2">
          <PremiumBadge />
        </div>
      )}
      <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h2>
      {article.excerpt && (
        <div
          className="mt-3 leading-8 text-muted"
          dangerouslySetInnerHTML={{ __html: sanitizeExcerptHtml(article.excerpt) }}
        />
      )}
      <span className="mt-4 inline-block rounded-md bg-banner-yellow px-4 py-1.5 text-xs font-medium text-foreground transition-opacity group-hover:opacity-90">
        ادامه‌ی مطلب
      </span>
    </Link>
  );
}
