export type PaymentMethodId = "bank_gateway" | "paypal" | "crypto";

export interface ArticlePriceInfo {
  slug: string;
  title: string;
  priceUSD?: number;
  priceIRR?: number;
}

export interface CheckoutResult {
  ok: boolean;
  redirectUrl?: string;
  message: string;
}

// هر روش پرداخت این قرارداد رو پیاده می‌کنه. الان فقط ساختارش تعریف شده؛
// وصل‌کردن هرکدوم به یه درگاه واقعی (زرین‌پال، PayPal، NOWPayments و امثالش)
// یعنی نوشتن پیاده‌سازی واقعی createCheckout در فایل جداگانه‌ی همون provider،
// بدون این‌که بقیه‌ی سایت (PaymentOptions, PaywallGate) تغییری نیاز داشته باشن.
export interface PaymentProvider {
  id: PaymentMethodId;
  label: string;
  description: string;
  currencies: string[];
  available: boolean;
  createCheckout: (article: ArticlePriceInfo) => Promise<CheckoutResult>;
}
