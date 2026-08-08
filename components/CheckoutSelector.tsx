"use client";

import { useMemo, useState } from "react";
import PaymentOptions from "./PaymentOptions";
import { formatToman, formatUSD } from "@/lib/format";

interface CheckoutArticle {
  id: string;
  title: string;
  priceIRR?: number;
  priceUSD?: number;
  alreadyOwned: boolean;
}

export default function CheckoutSelector({ articles }: { articles: CheckoutArticle[] }) {
  const purchasable = articles.filter((a) => !a.alreadyOwned);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totals = useMemo(() => {
    return purchasable
      .filter((a) => selected.has(a.id))
      .reduce(
        (acc, a) => ({
          irr: acc.irr + (a.priceIRR ?? 0),
          usd: acc.usd + (a.priceUSD ?? 0),
        }),
        { irr: 0, usd: 0 }
      );
  }, [selected, purchasable]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {articles.map((article) => (
          <li
            key={article.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                disabled={article.alreadyOwned}
                checked={article.alreadyOwned || selected.has(article.id)}
                onChange={() => toggle(article.id)}
              />
              <span className={article.alreadyOwned ? "text-muted line-through" : ""}>
                {article.title}
              </span>
            </label>
            <span className="text-xs text-muted">
              {article.alreadyOwned
                ? "خریداری‌شده"
                : `${formatToman(article.priceIRR) ?? "—"} / ${formatUSD(article.priceUSD) ?? "—"}`}
            </span>
          </li>
        ))}
      </ul>

      {selected.size > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-background-soft p-6">
          <p className="mb-4 text-sm text-muted">
            جمع {selected.size} مقاله: {formatToman(totals.irr)} / {formatUSD(totals.usd)}
          </p>
          <PaymentOptions priceIRR={totals.irr} priceUSD={totals.usd} />
        </div>
      )}
    </div>
  );
}
