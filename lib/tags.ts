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

// ورودی این تابع مستقیماً از URL (پارامتر مسیر) میاد، پس ممکنه percent-encoding
// نامعتبر/ناقص داشته باشه (مثلاً یک "%" تنها) که decodeURIComponent روش
// URIError می‌ندازه. باید همچین ورودی‌ای رو با notFound() (۴۰۴) جواب داد،
// نه این‌که با یک exception هندل‌نشده به خطای ۵۰۰ بیفته؛ برای همین اینجا
// قورت داده می‌شه و null برمی‌گرده — فراخوان‌کننده‌ها (صفحه/متادیتا) با
// چک‌کردن null این حالت رو به notFound()/متادیتای خالی تبدیل می‌کنن.
export function tagFromRouteParam(param: string): string | null {
  try {
    const decoded = decodeURIComponent(param).trim();
    return decoded.length > 0 ? decoded : null;
  } catch {
    return null;
  }
}
