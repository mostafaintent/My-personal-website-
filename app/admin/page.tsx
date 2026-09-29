import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { daysAgoIso, nowIso, formatJalaliDate } from "@/lib/format";
import {
  bucketByDay,
  calcPercentChange,
  countByKey,
  countTagFrequency,
  findArticlesNeedingAttention,
  matchArticlePathToSlug,
  splitWeeks,
  topNByCount,
  ATTENTION_REASON_LABELS,
  type ArticleAttentionInput,
} from "@/lib/admin-insights";
import TrendChart from "@/components/admin/TrendChart";
import Tag from "@/components/Tag";

export const metadata = { title: "داشبورد مدیریت" };
export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-accent"
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}

// همون StatCard، به‌علاوه‌ی درصد تغییر نسبت به بازهٔ قبلی (اگر بازهٔ قبلی
// صفر بود، به‌جای یک درصدِ گمراه‌کننده، پیام خنثی نشون می‌ده).
function StatCardWithTrend({
  label,
  value,
  percent,
  href,
}: {
  label: string;
  value: number;
  percent: number | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-accent"
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value.toLocaleString("fa-IR")}</p>
      <p className={`mt-1 text-xs ${percent === null ? "text-muted-light" : percent < 0 ? "text-accent" : "text-foreground"}`}>
        {percent === null
          ? "داده‌ی کافی برای مقایسه نیست"
          : `${percent >= 0 ? "+" : ""}${percent.toLocaleString("fa-IR")}٪ نسبت به هفته‌ی قبل`}
      </p>
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-medium text-muted-light">{children}</p>;
}

function Widget({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="mb-4 text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const fourteenDaysAgo = daysAgoIso(14);
  const nowIsoStr = nowIso();

  const [
    { data: articlesFull },
    { count: commentsTotal },
    { data: commentsRecent14d },
    { count: usersTotal },
    { data: usersRecent14d },
    { data: viewsRecent14d },
    { data: topViewPaths },
    { data: topLikedRows },
    { data: topFavoritedRows },
    { data: recentComments },
    { data: recentUsers },
    { count: activeSubs },
    { count: expiredSubs },
    { count: completedPurchases },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id, slug, title, status, excerpt, cover_image_url, tags, updated_at"),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("created_at").gte("created_at", fourteenDaysAgo),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("created_at").gte("created_at", fourteenDaysAgo),
    supabase.from("page_views").select("created_at").gte("created_at", fourteenDaysAgo),
    // بدون ORDER صریح + LIMIT، Supabase/PostgREST به‌صورت پیش‌فرض حداکثر ۱۰۰۰
    // ردیف برمی‌گردونه؛ برای اینکه این ۱۰۰۰ تا معنادار باشن (نه رندوم)، بر
    // اساس تازگی مرتب می‌شن — یعنی «پربازدید» در واقع «پربازدید در ۱۰۰۰
    // بازدید اخیر»ه، نه لزوماً کل تاریخ سایت (محدودیت شناخته‌شده).
    supabase.from("page_views").select("path").order("created_at", { ascending: false }).limit(1000),
    supabase.from("article_likes").select("article_id").limit(1000),
    supabase.from("article_favorites").select("article_id").limit(1000),
    supabase
      .from("comments")
      .select("id, body, created_at, article:articles(title, slug)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("profiles").select("id, display_name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gt("current_period_end", nowIsoStr),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .or(`status.neq.active,current_period_end.lte.${nowIsoStr}`),
    supabase.from("purchases").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  const articles = articlesFull ?? [];
  const publishedArticles = articles.filter((a) => a.status === "published");
  const articlesById = new Map(articles.map((a) => [a.id, a]));
  const articlesBySlug = new Map(articles.map((a) => [a.slug, a]));

  // --- بازدید ۱۴ روزه: هم برای نمودار، هم برای درصدِ تغییرِ هفتگی ---
  const viewsDaily = bucketByDay(
    (viewsRecent14d ?? []).map((v) => v.created_at),
    14,
    now
  );
  const { thisWeek: viewsThisWeek, lastWeek: viewsLastWeek } = splitWeeks(viewsDaily);
  const viewsPercent = calcPercentChange(viewsThisWeek, viewsLastWeek);

  const commentsDaily = bucketByDay(
    (commentsRecent14d ?? []).map((c) => c.created_at),
    14,
    now
  );
  const { thisWeek: commentsThisWeek, lastWeek: commentsLastWeek } = splitWeeks(commentsDaily);
  const commentsPercent = calcPercentChange(commentsThisWeek, commentsLastWeek);

  const usersDaily = bucketByDay(
    (usersRecent14d ?? []).map((u) => u.created_at),
    14,
    now
  );
  const { thisWeek: usersThisWeek, lastWeek: usersLastWeek } = splitWeeks(usersDaily);
  const usersPercent = calcPercentChange(usersThisWeek, usersLastWeek);

  // --- مقالات پربازدید: تطبیق مسیر با اسلاگ، جمع‌بندی سمت جاوااسکریپت ---
  const knownSlugs = new Set(articles.map((a) => a.slug));
  const viewCountsBySlug = new Map<string, number>();
  let unmatchedViews = 0;
  (topViewPaths ?? []).forEach(({ path }) => {
    const slug = matchArticlePathToSlug(path, knownSlugs);
    if (slug) viewCountsBySlug.set(slug, (viewCountsBySlug.get(slug) ?? 0) + 1);
    else if (path.startsWith("/articles/")) unmatchedViews += 1;
  });
  const topViewed = topNByCount(viewCountsBySlug, 5)
    .map(({ key: slug, count }) => ({ article: articlesBySlug.get(slug), count }))
    .filter((r): r is { article: NonNullable<typeof r.article>; count: number } => Boolean(r.article));

  // --- پرلایک‌ترین / پرعلاقه‌مندی‌ترین ---
  const topLiked = topNByCount(countByKey((topLikedRows ?? []).map((r) => r.article_id)), 5)
    .map(({ key: id, count }) => ({ article: articlesById.get(id), count }))
    .filter((r): r is { article: NonNullable<typeof r.article>; count: number } => Boolean(r.article));
  const topFavorited = topNByCount(countByKey((topFavoritedRows ?? []).map((r) => r.article_id)), 5)
    .map(({ key: id, count }) => ({ article: articlesById.get(id), count }))
    .filter((r): r is { article: NonNullable<typeof r.article>; count: number } => Boolean(r.article));

  // --- فعالیت اخیر: کامنت‌ها + کاربران تازه، ادغام‌شده و زمانی مرتب‌شده ---
  type Activity = { at: string; node: ReactNode };
  const commentActivities: Activity[] = ((recentComments ?? []) as unknown as {
    id: string;
    body: string;
    created_at: string;
    article: { title: string; slug: string } | null;
  }[]).map((c) => ({
    at: c.created_at,
    node: (
      <>
        نظر جدید {c.article && <>روی «{c.article.title}»</>}: {c.body.slice(0, 60)}
        {c.body.length > 60 ? "…" : ""}
      </>
    ),
  }));
  const userActivities: Activity[] = (recentUsers ?? []).map((u) => ({
    at: u.created_at,
    node: <>کاربر تازه: {u.display_name}</>,
  }));
  const activity = [...commentActivities, ...userActivities].sort((a, b) => (a.at < b.at ? 1 : -1));

  // --- نیازمند توجه ---
  const attentionInput: ArticleAttentionInput[] = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    status: a.status,
    excerpt: a.excerpt,
    coverImageUrl: a.cover_image_url,
    tags: a.tags,
    updatedAt: a.updated_at,
  }));
  const attentionItems = findArticlesNeedingAttention(attentionInput, now).slice(0, 8);

  // --- برچسب‌های پرکاربرد (فاز ۴) ---
  const tagFrequency = countTagFrequency(publishedArticles.map((a) => a.tags)).slice(0, 12);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/export"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
          >
            خروجی JSON برای هوش مصنوعی
          </Link>
          <Link
            href="/admin/articles/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + مقاله جدید
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <SectionLabel>رشد هفتگی</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardWithTrend
              label="بازدید این هفته"
              value={viewsThisWeek}
              percent={viewsPercent}
              href="/admin/analytics"
            />
            <StatCardWithTrend
              label="نظرات این هفته"
              value={commentsThisWeek}
              percent={commentsPercent}
              href="/admin/comments"
            />
            <StatCardWithTrend
              label="کاربران تازه این هفته"
              value={usersThisWeek}
              percent={usersPercent}
              href="/admin/users"
            />
          </div>
        </div>

        <Widget title="روند بازدید ۱۴ روز اخیر">
          <TrendChart data={viewsDaily} />
        </Widget>

        <div className="grid gap-6 sm:grid-cols-2">
          <Widget title="مقالات پربازدید">
            {topViewed.length > 0 ? (
              <ul className="flex flex-col gap-3 text-sm">
                {topViewed.map(({ article, count }) => (
                  <li key={article.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="truncate text-foreground hover:text-accent"
                    >
                      {article.title}
                    </Link>
                    <span className="shrink-0 text-muted">{count.toLocaleString("fa-IR")} بازدید</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow>هنوز بازدیدی به مقاله‌ای قابل‌تطبیق نبوده.</EmptyRow>
            )}
            {unmatchedViews > 0 && (
              <p className="mt-3 text-xs text-muted-light">
                {unmatchedViews.toLocaleString("fa-IR")} بازدید مقاله قابل تطبیق با اسلاگ فعلی نبود (مثلاً مقاله‌ی حذف‌شده).
              </p>
            )}
          </Widget>

          <Widget title="بیشترین لایک و علاقه‌مندی">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-xs text-muted-light">پرلایک‌ترین</p>
                {topLiked.length > 0 ? (
                  <ul className="flex flex-col gap-2 text-sm">
                    {topLiked.map(({ article, count }) => (
                      <li key={article.id} className="flex items-center justify-between gap-2">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="truncate text-foreground hover:text-accent"
                        >
                          {article.title}
                        </Link>
                        <span className="shrink-0 text-xs text-muted">{count.toLocaleString("fa-IR")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyRow>هنوز لایکی نیست.</EmptyRow>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-light">پرعلاقه‌مندی‌ترین</p>
                {topFavorited.length > 0 ? (
                  <ul className="flex flex-col gap-2 text-sm">
                    {topFavorited.map(({ article, count }) => (
                      <li key={article.id} className="flex items-center justify-between gap-2">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="truncate text-foreground hover:text-accent"
                        >
                          {article.title}
                        </Link>
                        <span className="shrink-0 text-xs text-muted">{count.toLocaleString("fa-IR")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyRow>هنوز علاقه‌مندی‌ای نیست.</EmptyRow>
                )}
              </div>
            </div>
          </Widget>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Widget title="فعالیت اخیر">
            {activity.length > 0 ? (
              <ul className="flex flex-col gap-3 text-sm">
                {activity.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <span className="text-foreground">{item.node}</span>
                    <time className="shrink-0 text-xs text-muted-light">{formatJalaliDate(item.at)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow>هنوز فعالیتی ثبت نشده.</EmptyRow>
            )}
          </Widget>

          <Widget title="نیازمند توجه">
            {attentionItems.length > 0 ? (
              <ul className="flex flex-col gap-3 text-sm">
                {attentionItems.map((item, i) => (
                  <li key={`${item.id}-${item.reason}-${i}`} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/articles/${item.id}/edit`}
                      className="truncate text-foreground hover:text-accent"
                    >
                      {item.title}
                    </Link>
                    <span className="shrink-0 rounded-full bg-background-soft px-2 py-0.5 text-xs text-muted">
                      {ATTENTION_REASON_LABELS[item.reason]}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyRow>چیزی نیازمند توجه نیست 🎉</EmptyRow>
            )}
          </Widget>
        </div>

        {tagFrequency.length > 0 && (
          <Widget title="برچسب‌های پرکاربرد">
            <div className="flex flex-wrap items-center gap-2">
              {tagFrequency.map(({ tag, count }) => (
                <span key={tag} className="inline-flex items-center gap-1.5">
                  <Tag label={tag} />
                  <span className="text-xs text-muted-light">{count.toLocaleString("fa-IR")}</span>
                </span>
              ))}
            </div>
          </Widget>
        )}

        <div>
          <SectionLabel>مقاله‌ها</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="همه‌ی مقالات" value={articles.length} href="/admin/articles" />
            <StatCard
              label="منتشرشده"
              value={publishedArticles.length}
              href="/admin/articles?status=published"
            />
            <StatCard label="کل نظرات" value={commentsTotal ?? 0} href="/admin/comments" />
          </div>
        </div>

        <div>
          <SectionLabel>کاربران</SectionLabel>
          <div className="grid gap-4 sm:max-w-xs">
            <StatCard label="کل کاربران ثبت‌نامی" value={usersTotal ?? 0} href="/admin/users" />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <SectionLabel>اشتراک و خرید</SectionLabel>
            <span className="mb-3 rounded-full bg-background-soft px-2 py-0.5 text-xs text-muted-light">
              غیرفعال — درگاه پرداخت هنوز وصل نشده
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="مشترکین فعال" value={activeSubs ?? 0} href="/admin/subscriptions?status=active" />
            <StatCard
              label="مشترکین منقضی/لغوشده"
              value={expiredSubs ?? 0}
              href="/admin/subscriptions?status=expired"
            />
            <StatCard
              label="خریدهای تکمیل‌شده"
              value={completedPurchases ?? 0}
              href="/admin/purchases?status=completed"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-background-soft p-6 text-sm leading-7 text-muted">
        <p>
          برای دادن دسترسی به یک کاربر خاص (تا مقاله‌های ویژه رو ببینه) یا فعال‌سازی
          دستی اشتراک، به بخش{" "}
          <Link href="/admin/access" className="text-accent hover:underline">
            دسترسی‌ها
          </Link>{" "}
          برید.
        </p>
        <p className="mt-2">
          برای جزئیات بیشتر بازدید (مثل کشور، دستگاه)، بخش Analytics داشبورد Vercel رو هم می‌تونید ببینید.
        </p>
      </div>
    </div>
  );
}
