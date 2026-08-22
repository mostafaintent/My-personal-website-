import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatJalaliDate } from "@/lib/format";
import { signOut } from "@/lib/actions/auth";
import {
  getFavoriteArticles,
  getLikedArticles,
  getRecentlyViewedArticles,
  getReadArticles,
  type ArticleRef,
} from "@/lib/interactions";

export const dynamic = "force-dynamic";
export const metadata = { title: "حساب من" };

function ArticleListCard({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: { key: string; article: ArticleRef; meta?: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              {item.article.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.article.cover_image_url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="min-w-0">
                <Link
                  href={`/articles/${encodeURIComponent(item.article.slug)}`}
                  className="block truncate text-sm text-accent hover:underline"
                >
                  {item.article.title}
                </Link>
                {item.meta && <span className="text-xs text-muted">{item.meta}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{emptyText}</p>
      )}
    </div>
  );
}

export default async function AccountPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const supabase = await createClient();

  const [
    { data: purchasesData },
    { data: subscription },
    { data: commentsData },
    favorites,
    likes,
    recentlyViewed,
    reads,
  ] = await Promise.all([
    supabase
      .from("purchases")
      .select("id, amount, currency, status, article:articles(slug, title)")
      .eq("user_id", current.id)
      .eq("status", "completed"),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", current.id)
      .eq("status", "active")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("comments")
      .select("id, body, created_at, article:articles(slug, title)")
      .eq("user_id", current.id)
      .order("created_at", { ascending: false }),
    getFavoriteArticles(current.id),
    getLikedArticles(current.id),
    getRecentlyViewedArticles(current.id),
    getReadArticles(current.id),
  ]);

  const purchases = purchasesData as unknown as
    | { id: string; article: { slug: string; title: string } | null }[]
    | null;
  const comments = commentsData as unknown as
    | { id: string; body: string; created_at: string; article: { slug: string; title: string } | null }[]
    | null;

  const lastViewed = recentlyViewed[0];

  return (
    <Container className="py-14">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {current.profile?.display_name ?? "کاربر"}
          </h1>
          <p className="text-sm text-muted">{current.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
          >
            خروج
          </button>
        </form>
      </div>

      {lastViewed && (
        <p className="mb-8 text-sm text-muted">
          آخرین فعالیت: بازدید از{" "}
          <Link
            href={`/articles/${encodeURIComponent(lastViewed.article.slug)}`}
            className="text-accent hover:underline"
          >
            {lastViewed.article.title}
          </Link>
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">مقاله‌های خریداری‌شده</p>
          <p className="mt-1 text-2xl font-bold">
            {purchases?.length ?? 0} مقاله
          </p>
          <ul className="mt-4 space-y-2">
            {purchases?.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/articles/${encodeURIComponent(p.article?.slug ?? "")}`}
                  className="text-sm text-accent hover:underline"
                >
                  {p.article?.title}
                </Link>
              </li>
            ))}
          </ul>
          {/* بخش «خریدها»/«محتوای خریداری‌شده» فعلاً همینه؛ در آینده اگه
              محتوای پولی جدید (کتابچه، PDF و...) اضافه بشه، همین بخش
              گسترش پیدا می‌کنه. */}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">وضعیت اشتراک</p>
          <p className="mt-1 text-2xl font-bold">
            {subscription
              ? subscription.plan === "monthly"
                ? "اشتراک ماهانه فعال"
                : "اشتراک سالانه فعال"
              : "بدون اشتراک فعال"}
          </p>
          {subscription ? (
            <p className="mt-2 text-sm text-muted">
              تا {formatJalaliDate(subscription.current_period_end)}
            </p>
          ) : (
            <Link href="/support" className="mt-2 inline-block text-sm text-accent hover:underline">
              مشاهده‌ی طرح‌های اشتراک
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <ArticleListCard
          title="مقالات مورد علاقه"
          emptyText="هنوز مقاله‌ای را ذخیره نکرده‌اید."
          items={favorites.map((f) => ({ key: f.id, article: f.article }))}
        />
        <ArticleListCard
          title="پسندیده‌های من"
          emptyText="هنوز مقاله‌ای را لایک نکرده‌اید."
          items={likes.map((l) => ({ key: l.id, article: l.article }))}
        />
        <ArticleListCard
          title="اخیراً دیده‌شده"
          emptyText="هنوز مقاله‌ای ندیده‌اید."
          items={recentlyViewed.map((v) => ({
            key: v.id,
            article: v.article,
            meta: formatJalaliDate(v.last_viewed_at),
          }))}
        />
        <ArticleListCard
          title="مقالات خوانده‌شده"
          emptyText="هنوز مقاله‌ای را کامل نخوانده‌اید."
          items={reads.map((r) => ({
            key: r.id,
            article: r.article,
            meta: formatJalaliDate(r.read_at),
          }))}
        />
      </div>

      <h2 className="mt-12 mb-4 text-xl font-bold">نظرات من</h2>
      <div className="space-y-3">
        {comments && comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted">
                زیر{" "}
                <Link
                  href={`/articles/${encodeURIComponent(c.article?.slug ?? "")}`}
                  className="text-accent hover:underline"
                >
                  {c.article?.title}
                </Link>{" "}
                · {formatJalaliDate(c.created_at)}
              </p>
              <p className="mt-2">{c.body}</p>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-border bg-background-soft p-6 text-center text-sm text-muted">
            هنوز نظری نگذاشته‌اید.
          </p>
        )}
      </div>
    </Container>
  );
}
