"use client";

import { useState } from "react";
import { renameCategory, deleteCategory } from "@/lib/actions/categories";

export default function CategoryAdminRow({
  id,
  name,
  articleCount,
}: {
  id: string;
  name: string;
  articleCount: number;
}) {
  const [value, setValue] = useState(name);
  const changed = value.trim() !== name && value.trim().length > 0;

  return (
    <form
      action={renameCategory.bind(null, id)}
      className="flex flex-wrap items-center gap-3 bg-card p-4"
    >
      <input
        name="name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <span className="text-xs text-muted">{articleCount} مقاله</span>
      {changed && (
        <button type="submit" className="text-xs text-accent hover:underline">
          ذخیره‌ی اسم جدید
        </button>
      )}
      <button
        type="button"
        disabled={articleCount > 0}
        title={articleCount > 0 ? "اول مقاله‌های این دسته را جابه‌جا کنید" : undefined}
        onClick={() => {
          if (confirm(`دسته‌ی «${name}» حذف بشه؟`)) deleteCategory(id);
        }}
        className="text-xs text-muted hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        حذف
      </button>
    </form>
  );
}
