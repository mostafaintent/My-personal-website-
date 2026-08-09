"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const siteName = String(formData.get("siteName") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const itemsPerPage = Math.max(1, Number(formData.get("itemsPerPage") ?? 5));
  const bannerImageUrl = String(formData.get("bannerImageUrl") ?? "").trim();

  let favoriteSlugs: string[] = [];
  try {
    favoriteSlugs = JSON.parse(String(formData.get("favoriteReads") ?? "[]"));
  } catch {
    favoriteSlugs = [];
  }

  let shareLinks: string[] = [];
  try {
    shareLinks = JSON.parse(String(formData.get("shareLinks") ?? "[]"));
  } catch {
    shareLinks = [];
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: siteName,
      author_name: authorName,
      bio,
      items_per_page: itemsPerPage,
      favorite_reads: favoriteSlugs,
      banner_image_url: bannerImageUrl,
      share_links: shareLinks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/admin/settings?message=" + encodeURIComponent("ذخیره شد"));
}
