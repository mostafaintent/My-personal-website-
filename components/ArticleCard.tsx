import Link from "next/link";
import { ArticleMeta } from "@/lib/articles";
import { formatJalaliDate } from "@/lib/format";
import PremiumBadge from "./PremiumBadge";
import Tag from "./Tag";

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link
      href={`/articles/${encodeURIComponent(article.slug)}`}
      className="group block border-b border-border py-8 first:pt-0 last:border-b-0"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <time>{formatJalaliDate(article.date)}</time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} دقیقه مطالعه</span>
        {article.premium && <PremiumBadge />}
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h2>
      <p className="mt-3 leading-8 text-muted">{article.excerpt}</p>
      {article.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}
