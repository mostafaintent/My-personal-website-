"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { FavoriteReadItem } from "@/lib/types/database";

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const siteName = String(formData.get("siteName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const itemsPerPage = Math.max(1, Number(formData.get("itemsPerPage") ?? 5));

  let favoriteReads: FavoriteReadItem[] = [];
  try {
    favoriteReads = JSON.parse(String(formData.get("favoriteReads") ?? "[]"));
  } catch {
    favoriteReads = [];
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: siteName,
      bio,
      items_per_page: itemsPerPage,
      favorite_reads: favoriteReads,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/admin/settings?message=" + encodeURIComponent("ذخیره شد"));
}
