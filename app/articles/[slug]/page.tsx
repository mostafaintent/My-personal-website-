import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import Container from "@/components/Container";
import PremiumBadge from "@/components/PremiumBadge";
import PaywallGate from "@/components/PaywallGate";
import Comments from "@/components/Comments";
import Tag from "@/components/Tag";
import { getArticleBySlug } from "@/lib/articles";
import { hasAccess } from "@/lib/payments/access";
import { getCurrentUser } from "@/lib/auth";
import { formatJalaliDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug));
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug));
  if (!article) notFound();

  const current = await getCurrentUser();
  const unlocked = await hasAccess(current?.id ?? null, article);

  return (
    <Container narrow className="py-14">
      <article>
        <header className="mb-10 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
            <time>{formatJalaliDate(article.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} دقیقه مطالعه</span>
            <span aria-hidden>·</span>
            <span>{article.category}</span>
            {article.premium && <PremiumBadge />}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>
          {article.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {article.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
        </header>

        <div
          className="prose-article"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(article.content, {
              ADD_ATTR: ["style", "target", "rel"],
            }),
          }}
        />

        {article.premium && !unlocked && (
          <PaywallGate
            priceIRR={article.priceIRR}
            priceUSD={article.priceUSD}
            isLoggedIn={Boolean(current)}
          />
        )}

        {unlocked && <Comments articleId={article.id} articleSlug={article.slug} />}
      </article>
    </Container>
  );
}
