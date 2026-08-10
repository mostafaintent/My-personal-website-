import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { daysAgoIso, nowIso } from "@/lib/format";

export const metadata = { title: "داشبورد مدیریت" };

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const dayAgo = daysAgoIso(1);
  const weekAgo = daysAgoIso(7);
  const now = nowIso();

  const [
    { count: total },
    { count: published },
    { count: commentsCount },
    { count: usersTotal },
    { count: usersNew },
    { count: activeSubs },
    { count: expiredSubs },
    { count: completedPurchases },
    { count: viewsToday },
    { count: viewsWeek },
    { count: viewsTotal },
  ] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gt("current_period_end", now),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .or(`status.neq.active,current_period_end.lte.${now}`),
    supabase.from("purchases").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("page_views").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + مقاله جدید
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">بازدید سایت</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="بازدید ۲۴ ساعت اخیر" value={viewsToday ?? 0} />
            <StatCard label="بازدید ۷ روز اخیر" value={viewsWeek ?? 0} />
            <StatCard label="کل بازدیدها" value={viewsTotal ?? 0} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">مقاله‌ها</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="همه‌ی مقالات" value={total ?? 0} />
            <StatCard label="منتشرشده" value={published ?? 0} />
            <StatCard label="نظرات" value={commentsCount ?? 0} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">کاربران</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="کل کاربران ثبت‌نامی" value={usersTotal ?? 0} />
            <StatCard label="کاربران جدید (۷ روز اخیر)" value={usersNew ?? 0} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">اشتراک و خرید</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="مشترکین فعال" value={activeSubs ?? 0} />
            <StatCard label="مشترکین منقضی/لغوشده" value={expiredSubs ?? 0} />
            <StatCard label="خریدهای تکمیل‌شده" value={completedPurchases ?? 0} />
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
          برای جزئیات بیشتر بازدید (مثل کشور، دستگاه، صفحات پربازدید)، بخش
          Analytics داشبورد Vercel رو هم می‌تونید ببینید.
        </p>
      </div>
    </div>
  );
}
