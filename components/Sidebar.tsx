import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { CATEGORIES } from "@/lib/articles";
import SearchBox from "./SearchBox";

const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/articles", label: "مقاله‌ها" },
];

export default async function Sidebar({ query }: { query?: string }) {
  const [current, settings, supabase] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
    createClient(),
  ]);

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

  return (
    <aside className="flex flex-col gap-8 text-sm">
      {settings.bio && <p className="leading-7 text-muted">{settings.bio}</p>}

      <nav className="flex flex-col gap-2">
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
          <p className="mb-3 font-semibold">دسته‌ها</p>
          <ul className="flex flex-col gap-2">
            {CATEGORIES.filter((c) => categoryCounts.has(c)).map((c) => (
              <li key={c}>
                <Link
                  href={`/articles?category=${encodeURIComponent(c)}`}
                  className="text-muted transition-colors hover:text-accent"
                >
                  {c} <span className="text-xs">({categoryCounts.get(c)})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {yearCounts.size > 0 && (
        <div>
          <p className="mb-3 font-semibold">بایگانی</p>
          <ul className="flex flex-col gap-2">
            {Array.from(yearCounts.entries()).map(([year, count]) => (
              <li key={year} className="text-muted">
                {year} <span className="text-xs">({count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {settings.favoriteReads.length > 0 && (
        <div>
          <p className="mb-3 font-semibold">برگزیده‌ها</p>
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
                  <span className="text-muted transition-colors group-hover:text-accent">
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
