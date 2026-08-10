"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function invalidate() {
  updateTag("categories");
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/articles");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect(`/admin/categories?error=${encodeURIComponent("اسم دسته را وارد کنید")}`);
  }

  const supabase = await createClient();
  const { count } = await supabase.from("categories").select("*", { count: "exact", head: true });
  const { error } = await supabase.from("categories").insert({ name, sort_order: count ?? 0 });

  if (error) {
    const message = error.code === "23505" ? "دسته‌ای با این اسم از قبل هست" : error.message;
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }

  invalidate();
  redirect("/admin/categories?message=" + encodeURIComponent("دسته اضافه شد"));
}

export async function renameCategory(categoryId: string, formData: FormData) {
  await requireAdmin();
  const newName = String(formData.get("name") ?? "").trim();
  if (!newName) {
    redirect(`/admin/categories?error=${encodeURIComponent("اسم دسته را وارد کنید")}`);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (!existing) {
    redirect(`/admin/categories?error=${encodeURIComponent("دسته پیدا نشد")}`);
  }

  if (existing.name !== newName) {
    const { error } = await supabase
      .from("categories")
      .update({ name: newName })
      .eq("id", categoryId);

    if (error) {
      const message = error.code === "23505" ? "دسته‌ای با این اسم از قبل هست" : error.message;
      redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
    }

    // مقاله‌هایی که با اسم قدیمی این دسته ثبت شده بودن، با اسم جدید یکی می‌شن.
    await supabase.from("articles").update({ category: newName }).eq("category", existing.name);
  }

  invalidate();
  redirect("/admin/categories?message=" + encodeURIComponent("دسته ویرایش شد"));
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (!existing) {
    redirect(`/admin/categories?error=${encodeURIComponent("دسته پیدا نشد")}`);
  }

  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("category", existing.name);

  if ((count ?? 0) > 0) {
    redirect(
      `/admin/categories?error=${encodeURIComponent(
        `این دسته ${count} مقاله دارد؛ اول مقاله‌ها را به دسته‌ی دیگری منتقل کنید`
      )}`
    );
  }

  await supabase.from("categories").delete().eq("id", categoryId);

  invalidate();
  redirect("/admin/categories?message=" + encodeURIComponent("دسته حذف شد"));
}
