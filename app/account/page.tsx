import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatJalaliDate } from "@/lib/format";
import { signOut } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "حساب من" };

export default async function AccountPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const supabase = await createClient();

  const { data: purchasesData } = await supabase
    .from("purchases")
    .select("id, amount, currency, status, article:articles(slug, title)")
    .eq("user_id", current.id)
    .eq("status", "completed");
  const purchases = purchasesData as unknown as
    | { id: string; article: { slug: string; title: string } | null }[]
    | null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", current.id)
    .eq("status", "active")
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: commentsData } = await supabase
    .from("comments")
    .select("id, body, created_at, article:articles(slug, title)")
    .eq("user_id", current.id)
    .order("created_at", { ascending: false });
  const comments = commentsData as unknown as
    | { id: string; body: string; created_at: string; article: { slug: string; title: string } | null }[]
    | null;

  return (
    <Container className="py-14">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">مقاله‌های خریداری‌شده</p>
          <p className="font-display mt-1 text-2xl font-bold">
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
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">وضعیت اشتراک</p>
          <p className="font-display mt-1 text-2xl font-bold">
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

      <h2 className="font-display mt-12 mb-4 text-xl font-bold">نظرات من</h2>
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
