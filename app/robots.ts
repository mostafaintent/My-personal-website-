import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// ساده و استاندارد: فقط مسیرهای خصوصی/حساب کاربری/ادمین disallow می‌شن.
// آرشیو تگ و حالت‌های جست‌وجوی /articles عمداً disallow نشدن — چون هدف
// noindex,follow است، نه پنهان‌کردن از خزنده (برای همین با متاتگ robots
// همون صفحات کنترل می‌شن، نه اینجا).
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/checkout",
          "/auth",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
