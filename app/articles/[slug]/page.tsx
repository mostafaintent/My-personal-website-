import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Container from "@/components/Container";
import PremiumBadge from "@/components/PremiumBadge";
import PaywallGate from "@/components/PaywallGate";
import Tag from "@/components/Tag";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { hasAccess } from "@/lib/payments/access";
import { formatJalaliDate } from "@/lib/format";

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(decodeURIComponent(slug));
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(decodeURIComponent(slug));
  if (!article) notFound();

  const unlocked = article.premium ? await hasAccess(article.slug) : true;

  return (
    <Container narrow className="py-14">
      <article>
        <header className="mb-10 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
            <time>{formatJalaliDate(article.date)}</time>
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} دقیقه مطالعه</span>
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

        <div className="prose-article">
          <MDXRemote source={article.content} />
        </div>

        {article.premium && !unlocked && (
          <PaywallGate priceIRR={article.priceIRR} priceUSD={article.priceUSD} />
        )}
      </article>
    </Container>
  );
}
