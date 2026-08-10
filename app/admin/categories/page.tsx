import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/categories";
import { createCategory } from "@/lib/actions/categories";
import CategoryAdminRow from "@/components/admin/CategoryAdminRow";

export const metadata = { title: "دسته‌بندی‌ها" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();

  const [categories, { data: articleCategories }] = await Promise.all([
    getCategories(),
    supabase.from("articles").select("category"),
  ]);

  const countByName = new Map<string, number>();
  (articleCategories ?? []).forEach((a) => {
    countByName.set(a.category, (countByName.get(a.category) ?? 0) + 1);
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">دسته‌بندی‌ها</h1>
      <p className="mb-8 text-sm text-muted">
        دسته‌ی جدید اضافه کنید، اسم دسته‌ای را عوض کنید، یا دسته‌ای را حذف کنید. برای
        جابه‌جا کردن یک مقاله از دسته‌ای به دسته‌ی دیگر، همان دسته را در صفحه‌ی ویرایش
        مقاله عوض کنید.
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-lg border border-border bg-background-soft px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <form action={createCategory} className="mb-8 flex gap-2">
        <input
          name="name"
          placeholder="اسم دسته‌ی جدید"
          required
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          افزودن
        </button>
      </form>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {categories.length > 0 ? (
          categories.map((c) => (
            <CategoryAdminRow
              key={c.id}
              id={c.id}
              name={c.name}
              articleCount={countByName.get(c.name) ?? 0}
            />
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هنوز دسته‌ای ساخته نشده.</p>
        )}
      </div>
    </div>
  );
}
