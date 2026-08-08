export function formatJalaliDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatToman(irr?: number): string | null {
  if (!irr) return null;
  const toman = Math.round(irr / 10);
  return `${toman.toLocaleString("fa-IR")} تومان`;
}

export function formatUSD(usd?: number): string | null {
  if (!usd) return null;
  return `$${usd}`;
}
