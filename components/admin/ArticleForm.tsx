"use client";

import { useState } from "react";
import type { ArticleRow } from "@/lib/types/database";

const CATEGORIES = ["یادداشت", "ادبیات", "فلسفه", "روان‌شناسی", "تاریخ", "عرفان", "ترجمه"];

export default function ArticleForm({
  action,
  defaultValues,
  error,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<ArticleRow>;
  error?: string;
}) {
  const [premium, setPremium] = useState(defaultValues?.premium ?? false);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        عنوان
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        اسلاگ (بخش آدرس، مثلاً: یادداشت-اول)
        <input
          name="slug"
          required
          defaultValue={defaultValues?.slug}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          dir="ltr"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        خلاصه
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={defaultValues?.excerpt}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        متن مقاله (فرمت Markdown)
        <textarea
          name="content"
          required
          rows={16}
          defaultValue={defaultValues?.content}
          className="rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-sm outline-none focus:border-accent"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          دسته‌بندی
          <select
            name="category"
            defaultValue={defaultValues?.category ?? "یادداشت"}
            className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          تگ‌ها (با کاما جدا کنید)
          <input
            name="tags"
            defaultValue={defaultValues?.tags?.join(", ")}
            className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="premium"
          checked={premium}
          onChange={(e) => setPremium(e.target.checked)}
        />
        محتوای ویژه (پولی)
      </label>

      {premium && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            قیمت به دلار
            <input
              name="priceUsd"
              type="number"
              step="0.5"
              defaultValue={defaultValues?.price_usd ?? undefined}
              className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            قیمت به ریال
            <input
              name="priceIrr"
              type="number"
              step="10000"
              defaultValue={defaultValues?.price_irr ?? undefined}
              className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        وضعیت
        <select
          name="status"
          defaultValue={defaultValues?.status ?? "draft"}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        >
          <option value="draft">پیش‌نویس</option>
          <option value="published">منتشرشده</option>
        </select>
      </label>

      <button
        type="submit"
        className="mt-2 self-start rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        ذخیره
      </button>
    </form>
  );
}
