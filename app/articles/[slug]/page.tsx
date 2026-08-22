import { notFound } from "next/navigation";
import { after } from "next/server";
import Container from "@/components/Container";
import PremiumBadge from "@/components/PremiumBadge";
import PaywallGate from "@/components/PaywallGate";
import Comments from "@/components/Comments";
import ShareBar from "@/components/ShareBar";
import Sidebar from "@/components/Sidebar";
import Tag from "@/components/Tag";
import ArticleInteractions from "@/components/ArticleInteractions";
import ReadTracker from "@/components/ReadTracker";
import { getArticleBySlug } from "@/lib/articles";
import { hasAccess } from "@/lib/payments/access";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { formatJalaliDate } from "@/lib/format";
import { sanitizeArticleHtml, stripHtmlToText } from "@/lib/sanitize";
import { getArticleLikeCount, getUserArticleFlags, logArticleView } from "@/lib/interactions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug));
  if (!article) return {};
  return { title: article.title, description: stripHtmlToText(article.excerpt) };
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
  const settings = await getSiteSettings();

  const [likeCount, flags] = await Promise.all([
    getArticleLikeCount(article.id),
    current
      ? getUserArticleFlags(current.id, article.id)
      : Promise.resolve({ liked: false, favorited: false }),
  ]);

  // ثبت بازدید نباید رندر صفحه رو کند کنه؛ با after() بعد از ارسالِ
  // پاسخ به کاربر اجرا می‌شه، نه قبلش. userId همین بالا (قبل از after)
  // خونده شده چون داخل Server Component نمی‌شه از کوکی/هدر داخل
  // after() استفاده کرد.
  if (current) {
    const userId = current.id;
    const articleId = article.id;
    after(() => logArticleView(userId, articleId));
  }

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_4fr]">
        <div className="hidden min-w-0 sm:block">
          <Sidebar />
        </div>

        <article className="mx-auto w-full max-w-2xl">
          <header className="mb-10 text-center">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
              <time>{formatJalaliDate(article.publishedAt)}</time>
              <span aria-hidden>·</span>
              <span>{article.readingMinutes} دقیقه مطالعه</span>
              <span aria-hidden>·</span>
              <span>{article.category}</span>
              {article.premium && <PremiumBadge />}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {article.title}
            </h1>
            {settings.authorName && (
              <p className="mt-3 text-sm text-muted">{settings.authorName}</p>
            )}
          </header>

          <div className="mb-8 flex justify-center">
            <ArticleInteractions
              articleId={article.id}
              articleSlug={article.slug}
              isLoggedIn={Boolean(current)}
              initialLiked={flags.liked}
              initialFavorited={flags.favorited}
              likeCount={likeCount}
            />
          </div>

          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
          />

          {unlocked && current && <ReadTracker articleId={article.id} />}

          {article.premium && !unlocked && (
            <PaywallGate
              priceIRR={article.priceIRR}
              priceUSD={article.priceUSD}
              isLoggedIn={Boolean(current)}
            />
          )}

          <div className="mt-8 flex justify-center">
            <ArticleInteractions
              articleId={article.id}
              articleSlug={article.slug}
              isLoggedIn={Boolean(current)}
              initialLiked={flags.liked}
              initialFavorited={flags.favorited}
              likeCount={likeCount}
            />
          </div>

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted">برچسب‌ها:</span>
              {article.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}

          <ShareBar
            path={`/articles/${encodeURIComponent(article.slug)}`}
            title={article.title}
            enabled={settings.shareLinks}
          />

          {unlocked && <Comments articleId={article.id} articleSlug={article.slug} />}
        </article>
      </div>
    </Container>
  );
}
