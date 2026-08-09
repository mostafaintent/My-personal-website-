import { createClient } from "@/lib/supabase/server";
import { grantArticleAccess, grantSubscription } from "@/lib/actions/access";

export const metadata = { title: "دسترسی‌ها" };

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const { data: premiumArticles } = await supabase
    .from("articles")
    .select("id, title")
    .eq("premium", true);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">اعطای دستی دسترسی</h1>
      <p className="mb-8 text-sm leading-7 text-muted">
        تا وقتی درگاه پرداخت واقعی وصل نشده، بعد از این‌که پول رو به‌صورت دستی
        (مثلاً کارت‌به‌کارت) دریافت کردید، از همین‌جا برای کاربر دسترسی فعال کنید.
      </p>

      {message && (
        <p className="mb-6 rounded-lg border border-border bg-background-soft px-4 py-3 text-sm text-muted">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <form action={grantArticleAccess} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">دسترسی به یک مقاله‌ی ویژه</h2>
          <input
            name="email"
            type="email"
            required
            placeholder="ایمیل کاربر"
            className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
          />
          <select
            name="articleId"
            required
            className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
          >
            <option value="">مقاله را انتخاب کنید</option>
            {premiumArticles?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="amount"
              type="number"
              placeholder="مبلغ دریافتی"
              className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
            />
            <select
              name="currency"
              className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
            >
              <option value="IRR">ریال</option>
              <option value="USD">دلار</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 self-start rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            فعال‌سازی دسترسی
          </button>
        </form>

        <form action={grantSubscription} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">اشتراک ماهانه/سالانه</h2>
          <input
            name="email"
            type="email"
            required
            placeholder="ایمیل کاربر"
            className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
          />
          <select
            name="plan"
            className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
          >
            <option value="monthly">ماهانه</option>
            <option value="yearly">سالانه</option>
          </select>
          <button
            type="submit"
            className="mt-2 self-start rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            فعال‌سازی اشتراک
          </button>
        </form>
      </div>
    </div>
  );
}
