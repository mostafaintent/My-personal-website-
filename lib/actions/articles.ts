"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { ArticleCategory, ArticleStatus } from "@/lib/types/database";

function readArticleForm(formData: FormData) {
  const premium = formData.get("premium") === "on";
  const tags = String(formData.get("tags") ?? "")
    .split(/[,،]/)
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    category: String(formData.get("category") ?? "یادداشت") as ArticleCategory,
    tags,
    premium,
    cover_image_url: String(formData.get("coverImageUrl") ?? "").trim() || null,
    price_usd: premium && formData.get("priceUsd") ? Number(formData.get("priceUsd")) : null,
    price_irr: premium && formData.get("priceIrr") ? Number(formData.get("priceIrr")) : null,
    status: String(formData.get("status") ?? "draft") as ArticleStatus,
  };
}

export async function createArticle(formData: FormData) {
  const admin = await requireAdmin();
  const fields = readArticleForm(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("articles").insert({
    ...fields,
    author_id: admin.id,
    published_at: fields.status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    redirect(`/admin/articles/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles");
}

export async function updateArticle(articleId: string, formData: FormData) {
  await requireAdmin();
  const fields = readArticleForm(formData);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("articles")
    .select("status, published_at")
    .eq("id", articleId)
    .single();

  const { error } = await supabase
    .from("articles")
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
      published_at:
        fields.status === "published"
          ? existing?.published_at ?? new Date().toISOString()
          : existing?.published_at ?? null,
    })
    .eq("id", articleId);

  if (error) {
    redirect(`/admin/articles/${articleId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/articles");
  revalidatePath("/");
  revalidatePath(`/articles/${fields.slug}`);
  redirect("/admin/articles");
}

export async function deleteArticle(articleId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", articleId);
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
}
