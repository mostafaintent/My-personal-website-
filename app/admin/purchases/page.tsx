import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatJalaliDate } from "@/lib/format";

export const metadata = { title: "خریدها" };

type PurchaseWithArticle = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed";
  created_at: string;
  article: { title: string } | null;
};

export default async function AdminPurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const admin = createAdminClient();
  const supabase = await createClient();

  let query = supabase
    .from("purchases")
    .select("id, user_id, amount, currency, status, created_at, article:articles(title)")
    .order("created_at", { ascending: false });
  if (status === "completed" || status === "pending") {
    query = query.eq("status", status);
  }

  const [{ data: purchasesData }, { data: authData }] = await Promise.all([
    query,
    admin.auth.admin.listUsers(),
  ]);

  const purchases = purchasesData as unknown as PurchaseWithArticle[] | null;
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? "—"]));

  const heading = status === "completed" ? "خریدهای تکمیل‌شده" : status === "pending" ? "خریدهای در انتظار" : "خریدها";

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{heading}</h1>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {purchases && purchases.length > 0 ? (
          purchases.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 bg-card p-4">
              <div>
                <p className="font-medium">{p.article?.title ?? "—"}</p>
                <p className="text-xs text-muted">
                  {emailMap.get(p.user_id) ?? "—"} · {p.amount.toLocaleString("fa-IR")} {p.currency} ·{" "}
                  {p.status === "completed" ? "تکمیل‌شده" : "در انتظار"} · {formatJalaliDate(p.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هیچ خریدی ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}
