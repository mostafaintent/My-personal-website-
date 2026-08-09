"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { FavoriteReadItem } from "@/lib/types/database";
import { uploadArticleImage } from "@/lib/storage";

export default function SettingsForm({
  action,
  initialSiteName,
  initialBio,
  initialItemsPerPage,
  initialFavoriteReads,
  error,
  message,
}: {
  action: (formData: FormData) => void;
  initialSiteName: string;
  initialBio: string;
  initialItemsPerPage: number;
  initialFavoriteReads: FavoriteReadItem[];
  error?: string;
  message?: string;
}) {
  const [favoriteReads, setFavoriteReads] = useState<FavoriteReadItem[]>(initialFavoriteReads);

  function updateItem(index: number, patch: Partial<FavoriteReadItem>) {
    setFavoriteReads((items) => items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeItem(index: number) {
    setFavoriteReads((items) => items.filter((_, i) => i !== index));
  }

  async function handleImageUpload(index: number, file: File) {
    try {
      const url = await uploadArticleImage(file);
      updateItem(index, { imageUrl: url });
    } catch {
      alert("آپلود عکس ناموفق بود.");
    }
  }

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      {error && (
        <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-border bg-background-soft px-4 py-3 text-sm text-muted">
          {message}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        نام سایت
        <input
          name="siteName"
          required
          defaultValue={initialSiteName}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        معرفی کوتاه (بالای ستون کناری نشان داده می‌شود)
        <textarea
          name="bio"
          rows={4}
          defaultValue={initialBio}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        تعداد مقاله در هر صفحه
        <input
          name="itemsPerPage"
          type="number"
          min={1}
          defaultValue={initialItemsPerPage}
          className="w-32 rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium">مطالب ویژه (کنار سایدبار)</p>
        <div className="flex flex-col gap-3">
          {favoriteReads.map((item, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background-soft">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted">بدون عکس</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  placeholder="عنوان"
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  placeholder="آدرس لینک (مثلاً /articles/...)"
                  value={item.url}
                  onChange={(e) => updateItem(index, { url: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  dir="ltr"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) handleImageUpload(index, file);
                  }}
                  className="text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-muted hover:text-accent"
                aria-label="حذف"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFavoriteReads((items) => [...items, { title: "", imageUrl: "", url: "" }])}
          className="mt-3 rounded-lg border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
        >
          + افزودن مورد
        </button>
      </div>

      <input type="hidden" name="favoriteReads" value={JSON.stringify(favoriteReads)} />

      <button
        type="submit"
        className="mt-2 self-start rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        ذخیره
      </button>
    </form>
  );
}
