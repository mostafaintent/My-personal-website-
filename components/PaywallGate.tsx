import { Lock } from "lucide-react";
import PaymentOptions from "./PaymentOptions";

export default function PaywallGate({
  priceIRR,
  priceUSD,
}: {
  priceIRR?: number;
  priceUSD?: number;
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
        از روش‌های زیر را برای پرداخت انتخاب کنید.
      </p>
      <div className="mt-6">
        <PaymentOptions priceIRR={priceIRR} priceUSD={priceUSD} />
      </div>
      <p className="mt-4 text-xs text-muted">
        درگاه‌های پرداخت هنوز در حال راه‌اندازی هستند.
      </p>
    </div>
  );
}
