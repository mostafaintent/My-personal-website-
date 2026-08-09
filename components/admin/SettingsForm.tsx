"use client";

import { useMemo, useState } from "react";
import { X, Plus } from "lucide-react";

const MAX_FAVORITES = 5;

interface ArticleOption {
  slug: string;
  title: string;
  imageUrl: string;
}

export default function SettingsForm({
  action,
  initialSiteName,
  initialBio,
  initialItemsPerPage,
  initialFavoriteSlugs,
  articles,
  error,
  message,
}: {
  action: (formData: FormData) => void;
  initialSiteName: string;
  initialBio: string;
  initialItemsPerPage: number;
  initialFavoriteSlugs: string[];
  articles: ArticleOption[];
  error?: string;
  message?: string;
}) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>(initialFavoriteSlugs);
  const [query, setQuery] = useState("");

  const bySlug = useMemo(() => new Map(articles.map((a) => [a.slug, a])), [articles]);
  const selectedSlugs = new Set(favoriteSlugs);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim();
    return articles.filter((a) => a.title.includes(q)).slice(0, 8);
  }, [query, articles]);

  function addItem(slug: string) {
    if (favoriteSlugs.length >= MAX_FAVORITES) return;
    if (selectedSlugs.has(slug)) return;
    setFavoriteSlugs((slugs) => [...slugs, slug]);
    setQuery("");
  }

  function removeItem(index: number) {
    setFavoriteSlugs((slugs) => slugs.filter((_, i) => i !== index));
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
        <p className="mb-1 text-sm font-medium">برگزیده‌ها (کنار سایدبار — حداکثر {MAX_FAVORITES} مورد)</p>
        <p className="mb-3 text-xs text-muted">
          عنوان یکی از مقاله‌های سایت را جست‌وجو کنید و از لیست انتخاب کنید. عکس و
          عنوان همیشه از خودِ مقاله خونده می‌شه، پس اگه بعداً تصویر شاخص مقاله رو
          عوض کنید، اینجا هم خودکار آپدیت می‌شه.
        </p>

        {favoriteSlugs.length > 0 && (
          <ul className="mb-4 flex flex-col gap-2">
            {favoriteSlugs.map((slug, index) => {
              const article = bySlug.get(slug);
              return (
                <li
                  key={slug}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background-soft">
                    {article?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted">بدون عکس</span>
                    )}
                  </div>
                  <span className="flex-1 text-sm">{article?.title ?? slug}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-muted hover:text-accent"
                    aria-label="حذف"
                  >
                    <X size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {favoriteSlugs.length < MAX_FAVORITES && (
          <div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجوی عنوان مقاله..."
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            {matches.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1 rounded-lg border border-border bg-card p-1">
                {matches.map((a) => {
                  const already = selectedSlugs.has(a.slug);
                  return (
                    <li key={a.slug}>
                      <button
                        type="button"
                        disabled={already}
                        onClick={() => addItem(a.slug)}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-start text-sm hover:bg-background-soft disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={14} className="shrink-0 text-accent" />
                        <span className="flex-1">{a.title}</span>
                        {already && <span className="text-xs text-muted">اضافه‌شده</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <input type="hidden" name="favoriteReads" value={JSON.stringify(favoriteSlugs)} />

      <button
        type="submit"
        className="mt-2 self-start rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        ذخیره
      </button>
    </form>
  );
}
