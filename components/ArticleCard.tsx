import Link from "next/link";
import { ArticleMeta } from "@/lib/articles";
import { formatJalaliDate } from "@/lib/format";
import PremiumBadge from "./PremiumBadge";
import Tag from "./Tag";

export default function ArticleCard({
  article,
  authorName,
  hideTags = false,
}: {
  article: ArticleMeta;
  authorName?: string;
  hideTags?: boolean;
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
      {article.excerpt && <p className="mt-3 leading-8 text-muted">{article.excerpt}</p>}
      {!hideTags && article.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}
      <span className="mt-4 inline-block rounded-md bg-accent px-4 py-1.5 text-xs font-medium text-white transition-opacity group-hover:opacity-90">
        خواندن مقاله
      </span>
    </Link>
  );
}
