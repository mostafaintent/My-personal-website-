import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getAllArticles, getArticlesByCategory, searchArticles } from "@/lib/articles";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "مقاله‌ها" };

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const settings = await getSiteSettings();

  const { articles, total, perPage } = q
    ? await searchArticles(q, page, settings.itemsPerPage)
    : category
      ? await getArticlesByCategory(category, page, settings.itemsPerPage)
      : await getAllArticles(page, settings.itemsPerPage);

  const heading = q ? `نتیجه‌ی جست‌وجو برای «${q}»` : category ? category : "آرشیو مقاله‌ها";
  const basePath = "/articles";
  const linkParams = { q, category };

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_4fr]">
        <div className="hidden min-w-0 sm:block">
          <Sidebar query={q} />
        </div>
        <div className="pl-[1.5cm]">
          <h1 className="mb-10 text-3xl font-bold">{heading}</h1>
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard key={article.slug} article={article} authorName={settings.authorName} />
            ))
          ) : (
            <p className="text-muted">چیزی پیدا نشد.</p>
          )}
          <Pagination
            total={total}
            page={page}
            perPage={perPage}
            basePath={basePath}
            searchParams={linkParams}
          />
        </div>
      </div>
    </Container>
  );
}
