import { paymentProviders } from "@/lib/payments/providers";
import { formatToman, formatUSD } from "@/lib/format";

export default function PaymentOptions({
  priceIRR,
  priceUSD,
}: {
  priceIRR?: number;
  priceUSD?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {paymentProviders.map((provider) => {
        const price =
          provider.currencies[0] === "IRR"
            ? formatToman(priceIRR)
            : formatUSD(priceUSD);
        return (
          <button
            key={provider.id}
            type="button"
            disabled={!provider.available}
            title={provider.description}
            className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-4 text-center transition-colors enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-medium text-foreground">{provider.label}</span>
            <span className="text-xs text-muted">{price ?? "—"}</span>
            {!provider.available && (
              <span className="mt-1 text-[11px] text-accent">به‌زودی</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
