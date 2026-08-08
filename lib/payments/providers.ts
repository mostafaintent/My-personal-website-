import { PaymentProvider } from "./types";

// این سه ماژول فعلاً فقط اسکلت هستن (available: false) چون این مرحله از پروژه
// روی طراحی و ساختار تمرکز داره، نه پرداخت واقعی.
// برای فعال‌کردن هرکدوم بعداً:
//   1. available رو true کن
//   2. createCheckout رو با فراخوانی API واقعی درگاه پر کن (کلیدها از env بیان)

const bankGatewayProvider: PaymentProvider = {
  id: "bank_gateway",
  label: "درگاه بانکی (ریالی)",
  description: "پرداخت مستقیم با کارت‌های بانکی ایرانی.",
  currencies: ["IRR"],
  available: false,
  async createCheckout(article) {
    return {
      ok: false,
      message: `اتصال درگاه بانکی هنوز فعال نشده. (مقاله: ${article.title})`,
    };
  },
};

const paypalProvider: PaymentProvider = {
  id: "paypal",
  label: "PayPal",
  description: "پرداخت بین‌المللی برای مخاطبان خارج از ایران.",
  currencies: ["USD"],
  available: false,
  async createCheckout(article) {
    return {
      ok: false,
      message: `اتصال PayPal هنوز فعال نشده. (مقاله: ${article.title})`,
    };
  },
};

const cryptoProvider: PaymentProvider = {
  id: "crypto",
  label: "ارز دیجیتال",
  description: "پرداخت با رمزارزهایی مثل USDT، برای مشتریانی که به درگاه ریالی یا PayPal دسترسی ندارند.",
  currencies: ["USDT", "BTC"],
  available: false,
  async createCheckout(article) {
    return {
      ok: false,
      message: `اتصال پرداخت کریپتویی هنوز فعال نشده. (مقاله: ${article.title})`,
    };
  },
};

export const paymentProviders: PaymentProvider[] = [
  bankGatewayProvider,
  paypalProvider,
  cryptoProvider,
];
