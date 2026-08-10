import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { getCategories } from "@/lib/categories";
import { createPublicClient } from "@/lib/supabase/public";
import SearchBox from "./SearchBox";

const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/articles", label: "مقاله‌ها" },
];

// دسته‌ها/بایگانی توی سایدبار روی همه‌ی صفحات ثابته و به‌ندرت عوض می‌شه؛
// کش‌کردنش یه رفت‌وبرگشت به دیتابیس رو از هر بار رندر سایدبار حذف می‌کنه.
const fetchSidebarStats = unstable_cache(
  async (): Promise<{ categoryCounts: [string, number][]; yearCounts: [string, number][] }> => {
    const supabase = createPublicClient();
    const { data: articles } = await supabase
      .from("articles")
      .select("category, published_at")
      .eq("status", "published");

    const categoryCounts = new Map<string, number>();
    const yearCounts = new Map<string, number>();

    (articles ?? []).forEach((a) => {
      categoryCounts.set(a.category, (categoryCounts.get(a.category) ?? 0) + 1);
      const year = new Date(a.published_at ?? "").toLocaleDateString("fa-IR-u-ca-persian", {
        year: "numeric",
      });
      yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    });

    return {
      categoryCounts: Array.from(categoryCounts.entries()),
      yearCounts: Array.from(yearCounts.entries()),
    };
  },
  ["sidebar-stats"],
  { revalidate: 60, tags: ["articles"] }
);

export default async function Sidebar({ query }: { query?: string }) {
  const [current, settings, stats, categories] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
    fetchSidebarStats(),
    getCategories(),
  ]);

  const categoryCounts = new Map(stats.categoryCounts);
  const yearCounts = new Map(stats.yearCounts);

  return (
    <aside className="flex flex-col gap-8 text-sm">
      {settings.bioEnabled && settings.bio && (
        <p className="leading-7 text-muted">{settings.bio}</p>
      )}

      <nav className="flex flex-col gap-3">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-foreground transition-colors hover:text-accent">
            {link.label}
          </Link>
        ))}
        {current?.profile?.role === "admin" && (
          <Link href="/admin" className="text-foreground transition-colors hover:text-accent">
            پنل مدیریت
          </Link>
        )}
        <Link
          href={current ? "/account" : "/login"}
          className="text-foreground transition-colors hover:text-accent"
        >
          {current ? "حساب من" : "ورود"}
        </Link>
      </nav>

      <SearchBox defaultValue={query} />

      {categoryCounts.size > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">دسته‌ها</p>
          <ul className="flex flex-col gap-3">
            {categories
              .filter((c) => categoryCounts.has(c.name))
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/articles?category=${encodeURIComponent(c.name)}`}
                    className="text-foreground transition-colors hover:text-accent"
                  >
                    {c.name} <span className="text-xs text-muted">({categoryCounts.get(c.name)})</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}

      {yearCounts.size > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">بایگانی</p>
          <ul className="flex flex-col gap-3">
            {Array.from(yearCounts.entries()).map(([year, count]) => (
              <li key={year} className="text-foreground">
                {year} <span className="text-xs text-muted">({count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {settings.favoriteReads.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-light">از اینجا شروع کن</p>
          <ul className="flex flex-col gap-5">
            {settings.favoriteReads.map((item, i) => (
              <li key={i}>
                <Link href={item.url} className="group block">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="mb-2 aspect-video w-full rounded-md object-cover"
                    />
                  )}
                  <span className="text-foreground transition-colors group-hover:text-accent">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
