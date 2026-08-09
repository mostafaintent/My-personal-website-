"use client";

import { useRef, useState } from "react";
import type { ArticleRow } from "@/lib/types/database";
import { slugify } from "@/lib/slug";
import { uploadArticleImage } from "@/lib/storage";
import RichTextEditor from "./RichTextEditor";

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
  const isEditing = Boolean(defaultValues?.slug);
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [premium, setPremium] = useState(defaultValues?.premium ?? false);
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(defaultValues?.cover_image_url ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const slug = isEditing ? (defaultValues?.slug ?? "") : slugify(title);

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const url = await uploadArticleImage(file);
      setCoverImageUrl(url);
    } catch {
      alert("آپلود عکس ناموفق بود.");
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
        />
      </label>
      <p className="text-xs text-muted" dir="ltr">
        /articles/{slug || "..."}
      </p>
      <input type="hidden" name="slug" value={slug} />

      <label className="flex flex-col gap-1 text-sm">
        خلاصه <span className="text-xs text-muted">(اختیاری — اگر خالی بماند، زیر عنوان چیزی نشان داده نمی‌شود)</span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={defaultValues?.excerpt}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
        />
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span>تصویر شاخص (اختیاری — برای نمایش در بخش «برگزیده‌ها»)</span>
        <div className="flex items-center gap-3">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-background-soft text-xs text-muted">
              بدون عکس
            </div>
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {uploadingCover ? "در حال آپلود..." : "انتخاب عکس"}
          </button>
          {coverImageUrl && (
            <button
              type="button"
              onClick={() => setCoverImageUrl("")}
              className="text-sm text-muted hover:text-accent"
            >
              حذف
            </button>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleCoverUpload(file);
          }}
        />
        <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span>متن مقاله</span>
        <RichTextEditor initialContent={content} onChange={setContent} />
        <input type="hidden" name="content" value={content} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          دسته‌بندی
          <select
            name="category"
            defaultValue={defaultValues?.category ?? "یادداشت"}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
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
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
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
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            قیمت به ریال
            <input
              name="priceIrr"
              type="number"
              step="10000"
              defaultValue={defaultValues?.price_irr ?? undefined}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        وضعیت
        <select
          name="status"
          defaultValue={defaultValues?.status ?? "draft"}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:border-accent"
        >
          <option value="draft">پیش‌نویس</option>
          <option value="published">منتشرشده</option>
        </select>
      </label>

      <button
        type="submit"
        className="sticky bottom-4 mt-2 self-start rounded-lg bg-accent px-8 py-3 font-medium text-white shadow-lg transition-opacity hover:opacity-90"
      >
        ذخیره
      </button>
    </form>
  );
}
