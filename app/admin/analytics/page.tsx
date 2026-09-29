import { createClient } from "@/lib/supabase/server";
import { daysAgoIso } from "@/lib/format";
import { groupByDayFromTimestamps, matchArticlePathToSlug } from "@/lib/admin-insights";
import TrendChart from "@/components/admin/TrendChart";

export const metadata = { title: "بازدید سایت" };

const RANGE_LABELS: Record<string, string> = {
  "1": "بازدید ۲۴ ساعت اخیر",
  "7": "بازدید ۷ روز اخیر",
  all: "کل بازدیدها",
};

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "all" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("page_views")
    .select("path, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (range === "1") query = query.gte("created_at", daysAgoIso(1));
  if (range === "7") query = query.gte("created_at", daysAgoIso(7));

  const [{ data: views }, { data: articles }] = await Promise.all([
    query,
    // برای نشون‌دادن عنوان مقاله به‌جای مسیر خام — همون الگوی تطبیق مسیرِ داشبورد اصلی.
    supabase.from("articles").select("slug, title"),
  ]);

  const slugToTitle = new Map((articles ?? []).map((a) => [a.slug, a.title]));
  const knownSlugs = new Set(slugToTitle.keys());

  const counts = new Map<string, number>();
  (views ?? []).forEach((v) => counts.set(v.path, (counts.get(v.path) ?? 0) + 1));
  const byPath = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  const dailyTrend = groupByDayFromTimestamps((views ?? []).map((v) => v.created_at));

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">بازدید سایت</h1>
      <p className="mb-8 text-sm text-muted">
        {RANGE_LABELS[range] ?? RANGE_LABELS.all} — مجموع {views?.length ?? 0} بازدید
      </p>

      {dailyTrend.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-semibold">روند روزانه</p>
          <TrendChart data={dailyTrend} />
        </div>
      )}

      <p className="mb-3 text-xs font-medium text-muted-light">صفحات پربازدید</p>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {byPath.length > 0 ? (
          byPath.map(([path, count]) => {
            const matchedSlug = matchArticlePathToSlug(path, knownSlugs);
            const title = matchedSlug ? slugToTitle.get(matchedSlug) : null;
            return (
              <div key={path} className="flex items-center justify-between gap-3 bg-card p-4">
                <div className="min-w-0">
                  {title ? (
                    <p className="truncate text-sm text-foreground">{title}</p>
                  ) : (
                    <p dir="ltr" className="truncate text-sm text-foreground">
                      {path}
                    </p>
                  )}
                  {title && (
                    <p dir="ltr" className="truncate text-xs text-muted-light">
                      {path}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-sm text-muted">{count} بازدید</p>
              </div>
            );
          })
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هنوز بازدیدی ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}
