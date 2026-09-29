import { stripHtmlToText } from "@/lib/sanitize";

// این فایل فقط توابع خالص (بدون Supabase) رو نگه می‌داره تا بدون دیتابیس
// قابل تست باشن — کوئری‌های واقعی مستقیم توی صفحه‌های ادمین می‌مونن، مثل
// الگوی خودِ app/admin/page.tsx که از قبل همین‌جوری بود.

// ============ درصد تغییر نسبت به بازهٔ قبلی ============

// وقتی بازهٔ قبلی صفر بوده، درصد بی‌معنیه (تقسیم بر صفر) — به‌جای عدد
// دروغین، null برمی‌گردونیم تا UI به‌جاش یه پیام مناسب («داده‌ی کافی برای
// مقایسه نیست») نشون بده.
export function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// ============ سبدبندی روزانه (برای نمودار ۱۴ روزه) ============

export interface DailyCount {
  date: string; // YYYY-MM-DD (UTC)
  count: number;
}

// timestamps: آرایه‌ای از created_at (ISO) — از قدیم به جدید نتیجه می‌ده،
// شامل روزهای بدون هیچ رکورد هم (count: 0)، تا نمودار شکاف نداشته باشه.
export function bucketByDay(timestamps: string[], days: number, now: Date = new Date()): DailyCount[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  timestamps.forEach((ts) => {
    const day = ts.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  });
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

// از همون ۱۴ روزِ سبدبندی‌شده، مجموع هفتهٔ اخیر و هفتهٔ قبلش رو جدا می‌کنه —
// تا برای درصدِ تغییر نیازی به یک کوئریِ count() جداگانه نباشه.
export function splitWeeks(daily: DailyCount[]): { thisWeek: number; lastWeek: number } {
  const lastWeek = daily.slice(0, 7).reduce((sum, d) => sum + d.count, 0);
  const thisWeek = daily.slice(7, 14).reduce((sum, d) => sum + d.count, 0);
  return { thisWeek, lastWeek };
}

// برخلاف bucketByDay (که یک بازهٔ ثابت رو با صفر پر می‌کنه)، این تابع برای
// صفحهٔ Analytics استفاده می‌شه که بازهٔ انتخابی متغیره («۱ روز»/«۷
// روز»/«همه») — فقط روزهایی که واقعاً بازدید داشتن رو برمی‌گردونه، از قدیم
// به جدید مرتب، و برای اینکه نمودار روی «همه» با صدها میله شلوغ نشه، به
// maxBuckets روز اخیر محدود می‌شه.
export function groupByDayFromTimestamps(timestamps: string[], maxBuckets = 30): DailyCount[] {
  const counts = new Map<string, number>();
  timestamps.forEach((ts) => {
    const day = ts.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-maxBuckets);
}

// ============ تطبیق مسیر بازدید با اسلاگ مقاله ============

// page_views.path مستقیماً article_id نداره؛ فقط رشتهٔ مسیر (مثلاً
// «/articles/<اسلاگ>») ذخیره شده. چون این مسیر از usePathname() مرورگر
// میاد، ممکنه بسته به مرورگر encode یا decode باشه — هر دو حالت رو
// امتحان می‌کنیم. اگر هیچ‌کدوم match نشد (percent-encoding نامعتبر یا
// اسلاگ حذف‌شده)، null برمی‌گردونیم؛ این محدودیت (نه یک fallback حدسی)
// در گزارش نهایی ذکر شده.
export function matchArticlePathToSlug(path: string, knownSlugs: ReadonlySet<string>): string | null {
  const prefix = "/articles/";
  if (!path.startsWith(prefix)) return null;
  const raw = path.slice(prefix.length);
  if (knownSlugs.has(raw)) return raw;
  try {
    const decoded = decodeURIComponent(raw);
    if (knownSlugs.has(decoded)) return decoded;
  } catch {
    // percent-encoding نامعتبر — نادیده گرفته می‌شه، حدس زده نمی‌شه
  }
  return null;
}

// ============ فراوانی تگ‌ها ============

export interface TagFrequency {
  tag: string;
  count: number;
}

export function countTagFrequency(articlesTags: string[][]): TagFrequency[] {
  const counts = new Map<string, number>();
  articlesTags.forEach((tags) => {
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// ============ مقالات نیازمند توجه ============

export type AttentionReason = "stale_draft" | "missing_excerpt" | "missing_cover" | "missing_tags";

export interface AttentionItem {
  id: string;
  slug: string;
  title: string;
  reason: AttentionReason;
}

export interface ArticleAttentionInput {
  id: string;
  slug: string;
  title: string;
  status: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  updatedAt: string;
}

const STALE_DRAFT_DAYS = 14;

// «خالی‌بودنِ» excerpt/بدون‌تگ فقط برای مقالات published چک می‌شه — برای
// یک پیش‌نویس طبیعیه که هنوز ناقص باشه، پس گزارش‌کردنش بی‌فایده‌ست. فقط
// «پیش‌نویس راکد» مخصوص draft هاست.
export function findArticlesNeedingAttention(
  articles: ArticleAttentionInput[],
  now: Date = new Date()
): AttentionItem[] {
  const staleThreshold = new Date(now.getTime() - STALE_DRAFT_DAYS * 24 * 60 * 60 * 1000);
  const items: AttentionItem[] = [];

  for (const article of articles) {
    const base = { id: article.id, slug: article.slug, title: article.title };

    if (article.status === "draft" && new Date(article.updatedAt) < staleThreshold) {
      items.push({ ...base, reason: "stale_draft" });
    }

    if (article.status === "published") {
      if (!stripHtmlToText(article.excerpt).trim()) {
        items.push({ ...base, reason: "missing_excerpt" });
      }
      if (!article.coverImageUrl) {
        items.push({ ...base, reason: "missing_cover" });
      }
      if (article.tags.length === 0) {
        items.push({ ...base, reason: "missing_tags" });
      }
    }
  }

  return items;
}

export const ATTENTION_REASON_LABELS: Record<AttentionReason, string> = {
  stale_draft: "پیش‌نویس بیش از ۱۴ روز دست‌نخورده",
  missing_excerpt: "بدون خلاصه",
  missing_cover: "بدون تصویر شاخص",
  missing_tags: "بدون تگ",
};

// ============ شمارش گروهی سادهٔ id ============

// برای article_id هایی که از article_likes/article_favorites خام میان —
// چون Supabase-js متد group-by نداره، این جمع‌بندی سمت جاوااسکریپت انجام
// می‌شه (همون الگویی که Sidebar از قبل برای شمارش دسته‌ها استفاده می‌کنه).
export function countByKey(ids: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  return counts;
}

export function topNByCount<T>(counts: Map<T, number>, limit: number): { key: T; count: number }[] {
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
