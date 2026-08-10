import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatJalaliDate, nowIso } from "@/lib/format";

export const metadata = { title: "مشترکین" };

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: subs }, { data: authData }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, user_id, plan, status, current_period_end, created_at")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers(),
  ]);

  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? "—"]));
  const now = nowIso();

  let rows = (subs ?? []).map((s) => ({
    ...s,
    email: emailMap.get(s.user_id) ?? "—",
    isActive: s.status === "active" && s.current_period_end > now,
  }));

  if (status === "active") rows = rows.filter((r) => r.isActive);
  if (status === "expired") rows = rows.filter((r) => !r.isActive);

  const heading =
    status === "active" ? "مشترکین فعال" : status === "expired" ? "مشترکین منقضی/لغوشده" : "مشترکین";

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{heading}</h1>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {rows.length > 0 ? (
          rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 bg-card p-4">
              <div>
                <p className="font-medium">{r.email}</p>
                <p className="text-xs text-muted">
                  {r.plan === "monthly" ? "ماهانه" : "سالانه"} ·{" "}
                  <span className={r.isActive ? "text-accent" : ""}>
                    {r.isActive ? "فعال" : "منقضی/لغوشده"}
                  </span>{" "}
                  · تا {formatJalaliDate(r.current_period_end)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هیچ اشتراکی پیدا نشد.</p>
        )}
      </div>
    </div>
  );
}
