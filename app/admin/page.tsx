import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "داشبورد مدیریت" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: total }, { count: published }, { count: commentsCount }] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("comments").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + مقاله جدید
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted">همه‌ی مقالات</p>
          <p className="mt-2 text-3xl font-bold">{total ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted">منتشرشده</p>
          <p className="mt-2 text-3xl font-bold">{published ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted">نظرات</p>
          <p className="mt-2 text-3xl font-bold">{commentsCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
