"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getCurrentUser } from "@/lib/auth";

export async function postComment(articleSlug: string, articleId: string, formData: FormData) {
  const current = await getCurrentUser();
  if (!current) {
    redirect(`/login?error=${encodeURIComponent("برای ثبت نظر باید وارد حساب شوید")}`);
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  await supabase.from("comments").insert({
    article_id: articleId,
    user_id: current.id,
    body,
  });

  revalidatePath(`/articles/${articleSlug}`);
}

export async function toggleCommentVisibility(commentId: string, nextStatus: "visible" | "hidden") {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("comments").update({ status: nextStatus }).eq("id", commentId);
  revalidatePath("/admin/comments");
}

export async function deleteCommentAdmin(commentId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin/comments");
}
