import { notFound } from "next/navigation";
import { after } from "next/server";
import type { Metadata } from "next";
import Container from "@/components/Container";
import PremiumBadge from "@/components/PremiumBadge";
import PaywallGate from "@/components/PaywallGate";
import Comments from "@/components/Comments";
import ShareBar from "@/components/ShareBar";
import Sidebar from "@/components/Sidebar";
import Tag from "@/components/Tag";
import ArticleInteractions from "@/components/ArticleInteractions";
import ReadTracker from "@/components/ReadTracker";
import RelatedArticles from "@/components/RelatedArticles";
import { getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { hasAccess } from "@/lib/payments/access";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";
import { formatJalaliDate } from "@/lib/format";
import { sanitizeArticleHtml, sanitizeExcerptHtml, stripHtmlToText } from "@/lib/sanitize";
import { buildArticleJsonLd, buildArticleMetadata, jsonLdToScriptString } from "@/lib/seo";
import { getArticleLikeCount, getUserArticleFlags, logArticleView } from "@/lib/interactions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug));
  if (!article) return {};

  const settings = await getSiteSettings();
  return buildArticleMetadata({
    title: article.title,
    descriptionText: stripHtmlToText(article.excerpt),
    siteUrl: getSiteUrl(),
    slug: article.slug,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt,
    authorName: settings.authorName,
  });
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

  const [likeCount, flags, relatedArticles] = await Promise.all([
    getArticleLikeCount(article.id),
    current
      ? getUserArticleFlags(current.id, article.id)
      : Promise.resolve({ liked: false, favorited: false }),
    getRelatedArticles(article),
  ]);

  const jsonLd = buildArticleJsonLd({
    title: article.title,
    slug: article.slug,
    siteUrl: getSiteUrl(),
    descriptionText: stripHtmlToText(article.excerpt),
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: settings.authorName,
  });

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
    <Container wide className="py-14 article-print-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdToScriptString(jsonLd) }}
      />
      <div className="grid gap-12 sm:grid-cols-[1fr_4fr]">
        <div className="hidden min-w-0 sm:block print:hidden">
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

          <div className="mb-8 flex justify-center print:hidden">
            <ArticleInteractions
              articleId={article.id}
              articleSlug={article.slug}
              isLoggedIn={Boolean(current)}
              initialLiked={flags.liked}
              initialFavorited={flags.favorited}
              likeCount={likeCount}
            />
          </div>

          {/* محتوای کامل فقط وقتی رندر می‌شه که مقاله رایگان باشه یا کاربر
              بهش دسترسی داشته باشه — همون الگوی ArticleFullCard؛ برخلاف
              نسخه‌ی قبلی، برای مقاله‌ی قفل، اصلاً article.content به RSC
              payload اضافه نمی‌شه، نه این‌که فقط با CSS/کلاینت مخفی بشه. */}
          {!article.premium || unlocked ? (
            <div
              className="prose-article"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
            />
          ) : (
            article.excerpt && (
              <div
                className="leading-8 text-muted"
                dangerouslySetInnerHTML={{ __html: sanitizeExcerptHtml(article.excerpt) }}
              />
            )
          )}

          {unlocked && current && <ReadTracker articleId={article.id} />}

          {article.premium && !unlocked && (
            <div className="print:hidden">
              <PaywallGate
                priceIRR={article.priceIRR}
                priceUSD={article.priceUSD}
                isLoggedIn={Boolean(current)}
              />
            </div>
          )}

          <div className="mt-8 flex justify-center print:hidden">
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
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm print:hidden">
              <span className="text-muted">برچسب‌ها:</span>
              {article.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}

          <div className="print:hidden">
            <ShareBar
              path={`/articles/${encodeURIComponent(article.slug)}`}
              title={article.title}
              enabled={settings.shareLinks}
            />
          </div>

          <RelatedArticles articles={relatedArticles} />

          {unlocked && (
            <div className="print:hidden">
              <Comments articleId={article.id} articleSlug={article.slug} />
            </div>
          )}
        </article>
      </div>
    </Container>
  );
}
