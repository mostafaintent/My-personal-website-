import { createClient } from "@/lib/supabase/server";
import type { FavoriteReadItem, SocialLink } from "@/lib/types/database";
import { SHARE_LINK_OPTIONS } from "@/lib/share-links";

export interface SiteSettings {
  siteName: string;
  authorName: string;
  bio: string;
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

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (!data) return DEFAULTS;

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
    itemsPerPage: data.items_per_page || DEFAULTS.itemsPerPage,
    favoriteReads,
    favoriteSlugs,
    bannerImageUrl: data.banner_image_url || "",
    shareLinks,
    socialLinks,
    footerNote: data.footer_note || DEFAULTS.footerNote,
  };
}
