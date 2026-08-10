import { createClient } from "@/lib/supabase/server";
import { daysAgoIso } from "@/lib/format";

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

  const { data: views } = await query;

  const counts = new Map<string, number>();
  (views ?? []).forEach((v) => counts.set(v.path, (counts.get(v.path) ?? 0) + 1));
  const byPath = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">بازدید سایت</h1>
      <p className="mb-8 text-sm text-muted">
        {RANGE_LABELS[range] ?? RANGE_LABELS.all} — مجموع {views?.length ?? 0} بازدید
      </p>

      <p className="mb-3 text-xs font-medium text-muted-light">صفحات پربازدید</p>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {byPath.length > 0 ? (
          byPath.map(([path, count]) => (
            <div key={path} className="flex items-center justify-between gap-3 bg-card p-4">
              <p dir="ltr" className="text-sm text-foreground">
                {path}
              </p>
              <p className="shrink-0 text-sm text-muted">{count} بازدید</p>
            </div>
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هنوز بازدیدی ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}
