import Link from "next/link";
import { Lock } from "lucide-react";
import PaymentOptions from "./PaymentOptions";

export default function PaywallGate({
  priceIRR,
  priceUSD,
  isLoggedIn,
}: {
  priceIRR?: number;
  priceUSD?: number;
  isLoggedIn: boolean;
}) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-background-soft p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Lock size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        این محتوا ویژه است
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        بخش رایگان این نوشته را در بالا خواندید. برای دسترسی به متن کامل، یکی
        از روش‌های زیر را برای پرداخت انتخاب کنید — یا با{" "}
        <Link href="/checkout" className="text-accent hover:underline">
          اشتراک ماهانه/سالانه
        </Link>{" "}
        به همه‌ی مقاله‌های ویژه دسترسی داشته باشید.
      </p>
      <div className="mt-6">
        <PaymentOptions priceIRR={priceIRR} priceUSD={priceUSD} />
      </div>
      {!isLoggedIn && (
        <p className="mt-4 text-xs text-muted">
          برای خرید، ابتدا{" "}
          <Link href="/login" className="text-accent hover:underline">
            وارد حساب
          </Link>{" "}
          شوید.
        </p>
      )}
      <p className="mt-2 text-xs text-muted">درگاه‌های پرداخت هنوز در حال راه‌اندازی هستند.</p>
    </div>
  );
}
