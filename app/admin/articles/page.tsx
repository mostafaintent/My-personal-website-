import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatJalaliDate } from "@/lib/format";
import DeleteArticleButton from "@/components/admin/DeleteArticleButton";

export const metadata = { title: "مقالات" };

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, status, category, premium, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">مقالات</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + مقاله جدید
        </Link>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {articles && articles.length > 0 ? (
          articles.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 bg-card p-4">
              <div>
                <p className="font-medium">
                  {a.title}{" "}
                  {a.premium && <span className="text-xs text-accent">(ویژه)</span>}
                </p>
                <p className="text-xs text-muted">
                  {a.category} · {a.status === "published" ? "منتشرشده" : "پیش‌نویس"} ·{" "}
                  {formatJalaliDate(a.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/articles/${encodeURIComponent(a.slug)}`} className="text-muted hover:text-accent">
                  مشاهده
                </Link>
                <Link href={`/admin/articles/${a.id}/edit`} className="text-accent hover:underline">
                  ویرایش
                </Link>
                <DeleteArticleButton articleId={a.id} />
              </div>
            </div>
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هنوز مقاله‌ای ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}
