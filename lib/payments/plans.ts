export interface SubscriptionPlanInfo {
  id: "monthly" | "yearly";
  label: string;
  description: string;
  priceUSD: number;
  priceIRR: number;
}

// این قیمت‌ها فقط برای نمایشه؛ وقتی درگاه واقعی وصل شد، از همین‌جا خونده می‌شن.
export const subscriptionPlans: SubscriptionPlanInfo[] = [
  {
    id: "monthly",
    label: "اشتراک ماهانه",
    description: "دسترسی به همه‌ی مقاله‌های ویژه تا وقتی اشتراک فعاله.",
    priceUSD: 4,
    priceIRR: 200000,
  },
  {
    id: "yearly",
    label: "اشتراک سالانه",
    description: "همون دسترسی کامل، با تخفیف نسبت به پرداخت ماهانه.",
    priceUSD: 36,
    priceIRR: 1800000,
  },
];
