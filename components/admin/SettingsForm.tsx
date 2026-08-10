"use client";

import { useMemo, useRef, useState } from "react";
import { X, Plus, Upload } from "lucide-react";
import { uploadSiteImage } from "@/lib/storage";
import { SHARE_LINK_OPTIONS } from "@/lib/share-links";

const MAX_FAVORITES = 5;

interface ArticleOption {
  slug: string;
  title: string;
  imageUrl: string;
}

interface SocialLinkEntry {
  label: string;
  url: string;
}

export default function SettingsForm({
  action,
  initialSiteName,
  initialAuthorName,
  initialBio,
  initialItemsPerPage,
  initialFavoriteSlugs,
  initialBannerImageUrl,
  initialShareLinks,
  initialSocialLinks,
  initialFooterNote,
  articles,
  error,
  message,
}: {
  action: (formData: FormData) => void;
  initialSiteName: string;
  initialAuthorName: string;
  initialBio: string;
  initialItemsPerPage: number;
  initialFavoriteSlugs: string[];
  initialBannerImageUrl: string;
  initialShareLinks: string[];
  initialSocialLinks: SocialLinkEntry[];
  initialFooterNote: string;
  articles: ArticleOption[];
  error?: string;
  message?: string;
}) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>(initialFavoriteSlugs);
  const [query, setQuery] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState(initialBannerImageUrl);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [shareLinks, setShareLinks] = useState<string[]>(initialShareLinks);
  const [socialLinks, setSocialLinks] = useState<SocialLinkEntry[]>(initialSocialLinks);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  function toggleShareLink(key: string) {
    setShareLinks((links) =>
      links.includes(key) ? links.filter((k) => k !== key) : [...links, key]
    );
  }

  function addSocialLink() {
    setSocialLinks((links) => [...links, { label: "", url: "" }]);
  }

  function updateSocialLink(index: number, field: "label" | "url", value: string) {
    setSocialLinks((links) =>
      links.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  }

  function removeSocialLink(index: number) {
    setSocialLinks((links) => links.filter((_, i) => i !== index));
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadSiteImage(file);
      setBannerImageUrl(url);
    } catch {
      alert("آپلود عکس بنر ناموفق بود. دوباره امتحان کنید.");
    } finally {
      setBannerUploading(false);
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
        اسم نویسنده (زیر عنوان هر مقاله نشان داده می‌شود)
        <input
          name="authorName"
          defaultValue={initialAuthorName}
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
        <p className="mb-1 text-sm font-medium">بنر بالای سایت</p>
        <p className="mb-3 text-xs text-muted">
          یک عکس برای نوار بالای سایت آپلود کنید. اگه عکسی انتخاب نکنید، فقط
          اسم سایت به‌صورت متن نشان داده می‌شه. برای اینکه بنر باریک و کشیده
          دیده بشه (شبیه الگوی مرجع)، بهتره عکسی با اندازه‌ی تقریبی{" "}
          <strong>۱۶۰۰ × ۲۰۰ پیکسل</strong> (پهن و کوتاه، نسبت حدود ۸ به ۱)
          آماده و آپلود کنید. عکس‌های با نسبت دیگه هم کار می‌کنن ولی ممکنه از
          بالا و پایین برش بخورن.
        </p>
        {bannerImageUrl && (
          <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg border border-border bg-background-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerImageUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setBannerImageUrl("")}
              className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground hover:text-accent"
              aria-label="حذف بنر"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          disabled={bannerUploading}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
        >
          <Upload size={14} />
          {bannerUploading ? "در حال آپلود..." : bannerImageUrl ? "تغییر عکس بنر" : "آپلود عکس بنر"}
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
        <input type="hidden" name="bannerImageUrl" value={bannerImageUrl} />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">لینک‌های اشتراک‌گذاری زیر مقاله</p>
        <p className="mb-3 text-xs text-muted">
          هر کدوم رو که می‌خواید کنار مقاله نشون داده بشه، تیک بزنید.
        </p>
        <div className="flex flex-wrap gap-3">
          {SHARE_LINK_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={shareLinks.includes(opt.key)}
                onChange={() => toggleShareLink(opt.key)}
                className="accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <input type="hidden" name="shareLinks" value={JSON.stringify(shareLinks)} />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">برگزیده‌ها (کنار سایدبار — حداکثر {MAX_FAVORITES} مورد)</p>
        <p className="mb-3 text-xs text-muted">
          عنوان یکی از مقاله‌های سایت را جست‌وجو کنید و از لیست انتخاب کنید. عکس و
          عنوان همیشه از خودِ مقاله خونده می‌شه، پس اگه بعداً تصویر شاخص مقاله رو
          عوض کنید، اینجا هم خودکار آپدیت می‌شه.
        </p>

        {favoriteSlugs.length > 0 && (
          <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {favoriteSlugs.map((slug, index) => {
              const article = bySlug.get(slug);
              return (
                <li
                  key={slug}
                  className="relative overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-background-soft">
                    {article?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted">بدون عکس</span>
                    )}
                  </div>
                  <p className="px-2 py-2 text-xs leading-5">{article?.title ?? slug}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted hover:text-accent"
                    aria-label="حذف"
                  >
                    <X size={14} />
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

      <div>
        <p className="mb-1 text-sm font-medium">لینک‌های شبکه‌های اجتماعی (پایین سایت)</p>
        <p className="mb-3 text-xs text-muted">
          هر تعداد لینک که می‌خواید اضافه کنید (تلگرام، ایمیل، اینستاگرام،
          واتساپ، یا هر پلتفرم دیگه‌ای) — می‌تونید کم یا زیادش کنید و
          آدرسش رو هر وقت خواستید عوض کنید.
        </p>
        <div className="flex flex-col gap-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateSocialLink(index, "label", e.target.value)}
                placeholder="عنوان (مثلاً تلگرام)"
                className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                placeholder="آدرس لینک"
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-muted hover:text-accent"
                aria-label="حذف لینک"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSocialLink}
          className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-accent"
        >
          <Plus size={14} className="text-accent" />
          افزودن لینک
        </button>
        <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        متن پاورقی (زیر لینک‌های اجتماعی، کنار اسم سایت نشان داده می‌شود)
        <textarea
          name="footerNote"
          rows={2}
          defaultValue={initialFooterNote}
          className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
        />
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
