// تنها منبع تعیین آدرس مطلق سایت برای metadata/sitemap/robots. برخلاف
// server actionها، این فایل‌ها (app/sitemap.ts، app/robots.ts، generateMetadata)
// لزوماً به هدرهای درخواست دسترسی قابل‌اتکا ندارن — برای همین از یک env
// متغیر با fallback به مقادیری که خودِ Vercel ست می‌کنه استفاده می‌کنیم.
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}
