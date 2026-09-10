import Link from "next/link";
import Container from "@/components/Container";
import { paymentProviders } from "@/lib/payments/providers";
import { subscriptionPlans } from "@/lib/payments/plans";
import { formatToman, formatUSD } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "حمایت",
};

export default async function SupportPage() {
  const settings = await getSiteSettings();

  return (
    <Container narrow className="py-14">
      <h1 className="mb-6 text-3xl font-bold">حمایت از {settings.siteName}</h1>
      <div className="prose-article">
        <p>
          بیشتر نوشته‌های این سایت رایگان هستند و همیشه رایگان خواهند ماند.
          اما نوشتن مقاله‌های بلند و ترجمه‌ها زمان و انرژی زیادی می‌برد — برای
          همین بعضی از آن‌ها را به‌صورت محتوای ویژه منتشر می‌کنم.
        </p>
        <p>
          خرید محتوای ویژه، یا حمایت مستقیم، مهم‌ترین راهی است که به ادامه‌ی
          این پروژه کمک می‌کند.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-border bg-card p-6">
            <p className="font-semibold">{plan.label}</p>
            <p className="mt-1 text-sm text-muted">{plan.description}</p>
            <p className="mt-4 text-sm">
              {formatToman(plan.priceIRR)} / {formatUSD(plan.priceUSD)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm">
        یا مقاله‌های ویژه را جدا جدا{" "}
        <Link href="/checkout" className="text-accent hover:underline">
          از این‌جا بخرید
        </Link>
        .
      </p>

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">روش‌های پرداخت</h2>
        <ul className="space-y-4">
          {paymentProviders.map((provider) => (
            <li key={provider.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{provider.label}</p>
                <p className="text-sm text-muted">{provider.description}</p>
              </div>
              <span className="shrink-0 text-xs text-accent">
                {provider.available ? "فعال" : "به‌زودی"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
