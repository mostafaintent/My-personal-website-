import { createClient } from "@/lib/supabase/server";
import type { FavoriteReadItem } from "@/lib/types/database";

export interface SiteSettings {
  siteName: string;
  bio: string;
  itemsPerPage: number;
  favoriteReads: FavoriteReadItem[];
}

const DEFAULTS: SiteSettings = {
  siteName: "نام سایت",
  bio: "خانه‌ای برای نوشتن آزاد — یادداشت‌ها، مقاله‌ها و ترجمه‌هایی درباره‌ی کتاب، فکر و زندگی.",
  itemsPerPage: 5,
  favoriteReads: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (!data) return DEFAULTS;

  return {
    siteName: data.site_name || DEFAULTS.siteName,
    bio: data.bio || DEFAULTS.bio,
    itemsPerPage: data.items_per_page || DEFAULTS.itemsPerPage,
    favoriteReads: data.favorite_reads ?? [],
  };
}
