import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import CheckoutSelector from "@/components/CheckoutSelector";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { subscriptionPlans } from "@/lib/payments/plans";
import { formatToman, formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "خرید مقاله‌های ویژه" };

export default async function CheckoutPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login?error=" + encodeURIComponent("برای خرید ابتدا وارد حساب شوید"));

  const supabase = await createClient();
  const [{ data: articles }, { data: purchases }] = await Promise.all([
    supabase.from("articles").select("id, title, price_irr, price_usd").eq("premium", true).eq("status", "published"),
    supabase.from("purchases").select("article_id").eq("user_id", current.id).eq("status", "completed"),
  ]);

  const ownedIds = new Set((purchases ?? []).map((p) => p.article_id));
  const checkoutArticles = (articles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    priceIRR: a.price_irr ?? undefined,
    priceUSD: a.price_usd ?? undefined,
    alreadyOwned: ownedIds.has(a.id),
  }));

  return (
    <Container narrow className="py-14">
      <h1 className="font-display mb-4 text-3xl font-bold">خرید مقاله‌های ویژه</h1>
      <p className="mb-8 text-sm leading-7 text-muted">
        می‌توانید چند مقاله را با هم انتخاب و یک‌جا پرداخت کنید — یا به‌جای خرید
        تک‌تک، یکی از طرح‌های اشتراک زیر را بردارید تا به همه‌ی محتوای ویژه
        دسترسی داشته باشید.
      </p>

      {checkoutArticles.length > 0 ? (
        <CheckoutSelector articles={checkoutArticles} />
      ) : (
        <p className="text-muted">فعلاً مقاله‌ی ویژه‌ای برای خرید موجود نیست.</p>
      )}

      <h2 className="font-display mt-14 mb-4 text-xl font-bold">یا با اشتراک</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-border bg-card p-6">
            <p className="font-display font-semibold">{plan.label}</p>
            <p className="mt-1 text-sm text-muted">{plan.description}</p>
            <p className="mt-4 text-sm">
              {formatToman(plan.priceIRR)} / {formatUSD(plan.priceUSD)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        فعال‌سازی اشتراک فعلاً به‌صورت دستی انجام می‌شه —{" "}
        <Link href="/support" className="text-accent hover:underline">
          صفحه‌ی حمایت
        </Link>{" "}
        رو ببینید.
      </p>
    </Container>
  );
}
