import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { FavoriteReadItem, SocialLink, SiteSettingsRow } from "@/lib/types/database";
import { SHARE_LINK_OPTIONS } from "@/lib/share-links";

export interface SiteSettings {
  siteName: string;
  authorName: string;
  bio: string;
  bioEnabled: boolean;
  itemsPerPage: number;
  favoriteReads: FavoriteReadItem[];
  favoriteSlugs: string[];
  bannerImageUrl: string;
  shareLinks: string[];
  socialLinks: SocialLink[];
  footerNote: string;
}

const DEFAULTS: SiteSettings = {
  siteName: "نام سایت",
  authorName: "بهرام نصیری",
  bio: "خانه‌ای برای نوشتن آزاد — یادداشت‌ها، مقاله‌ها و ترجمه‌هایی درباره‌ی کتاب، فکر و زندگی.",
  bioEnabled: false,
  itemsPerPage: 5,
  favoriteReads: [],
  favoriteSlugs: [],
  bannerImageUrl: "",
  shareLinks: SHARE_LINK_OPTIONS.map((o) => o.key),
  socialLinks: [
    { label: "ایمیل", url: "#" },
    { label: "تلگرام", url: "#" },
    { label: "اینستاگرام", url: "#" },
  ],
  footerNote: "تمام مقاله‌های رایگان اینجا با عشق نوشته می‌شن.",
};

// favorite_reads توی دیتابیس فقط یه آرایه از اسلاگه، نه عکس/عنوان — چون اگه
// عکس شاخصِ یه مقاله بعداً عوض بشه، این‌جوری بدون نیاز به آپدیت دستی برگزیده‌ها
// خودش تازه می‌مونه. (نسخه‌های قدیمی‌تر شیء کامل ذخیره می‌کردن؛ اینجا هردو حالت پشتیبانی می‌شه.)
function extractSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item) {
        const url = String((item as { url: unknown }).url ?? "");
        return decodeURIComponent(url.replace(/^\/articles\//, ""));
      }
      return "";
    })
    .filter(Boolean);
}

// این کوئری (تنظیمات سایت + لیست برگزیده‌ها) روی همه‌ی صفحات سایت اجرا
// می‌شه، برای همین نتیجه‌ش رو یک دقیقه کش می‌کنیم تا هر بازدید یه رفت‌وبرگشت
// جدید به Supabase نزنه. از کلاینت بدون کوکی استفاده می‌کنیم چون
// unstable_cache اجازه‌ی خوندن کوکی/session داخل تابع کش‌شده رو نمی‌ده.
const fetchSiteSettingsData = unstable_cache(
  async (): Promise<{ row: SiteSettingsRow; favoriteReads: FavoriteReadItem[] } | null> => {
    // این تابع حالا ممکنه موقع build (پیش‌رندر استاتیک صفحه‌های بدون
    // وابستگی dynamic) هم اجرا بشه، جایی که env variable ها یا اتصال شبکه
    // ممکنه در دسترس نباشن؛ برای همین به‌جای کرش کل build، روی خطا مقادیر
    // پیش‌فرض (DEFAULTS) رو برمی‌گردونیم.
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", true)
        .maybeSingle();

      if (!data) return null;

      const favoriteSlugs = extractSlugs(data.favorite_reads);
      let favoriteReads: FavoriteReadItem[] = [];

      if (favoriteSlugs.length > 0) {
        const { data: articles } = await supabase
          .from("articles")
          .select("slug, title, cover_image_url")
          .eq("status", "published")
          .in("slug", favoriteSlugs);

        const bySlug = new Map((articles ?? []).map((a) => [a.slug, a]));
        favoriteReads = favoriteSlugs
          .map((slug) => {
            const article = bySlug.get(slug);
            if (!article) return null;
            return {
              title: article.title,
              imageUrl: article.cover_image_url ?? "",
              url: `/articles/${encodeURIComponent(article.slug)}`,
            };
          })
          .filter((item): item is FavoriteReadItem => item !== null);
      }

      return { row: data, favoriteReads };
    } catch {
      return null;
    }
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] }
);

export async function getSiteSettings(): Promise<SiteSettings> {
  const cached = await fetchSiteSettingsData();
  if (!cached) return DEFAULTS;
  const { row: data, favoriteReads } = cached;

  const shareLinks = Array.isArray(data.share_links) && data.share_links.length > 0
    ? data.share_links
    : DEFAULTS.shareLinks;

  const socialLinks = Array.isArray(data.social_links) && data.social_links.length > 0
    ? data.social_links
    : DEFAULTS.socialLinks;

  return {
    siteName: data.site_name || DEFAULTS.siteName,
    authorName: data.author_name || DEFAULTS.authorName,
    bio: data.bio || DEFAULTS.bio,
    bioEnabled: Boolean(data.bio_enabled),
    itemsPerPage: data.items_per_page || DEFAULTS.itemsPerPage,
    favoriteReads,
    favoriteSlugs: extractSlugs(data.favorite_reads),
    bannerImageUrl: data.banner_image_url || "",
    shareLinks,
    socialLinks,
    footerNote: data.footer_note || DEFAULTS.footerNote,
  };
}
