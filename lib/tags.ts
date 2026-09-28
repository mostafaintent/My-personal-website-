// تگ‌ها entity مستقلی توی دیتابیس ندارن (روی articles.tags: text[] ذخیره
// می‌شن، بدون جدول/id جدا) — پس به‌جای ساختن یک slugification ساختگی
// (که برای تگ‌های فارسی یا collision-پذیره)، دقیقاً همون الگویی که برای
// اسلاگ مقاله‌ها استفاده می‌شه رو تکرار می‌کنیم: خودِ رشته‌ی تگ (trim‌شده)
// با encodeURIComponent/decodeURIComponent — deterministic، بدون collision
// (چون خودِ متن واقعیه، نه یک مشتق از آن)، و lookup معکوسش دقیقاً همون
// decode ساده‌ست.
export function tagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag.trim())}`;
}

export function tagFromRouteParam(param: string): string {
  return decodeURIComponent(param).trim();
}
