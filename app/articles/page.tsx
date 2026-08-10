import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getAllArticles, getArticlesByCategory, searchArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";
export const metadata = { title: "مقاله‌ها" };

// این صفحه (آرشیو/دسته‌بندی/جست‌وجو) برخلاف صفحه‌ی اصلی، متن کامل مقاله رو
// نشون نمی‌ده — فقط خلاصه — پس تعداد بیشتری در هر صفحه جا می‌شه؛ مستقل از
// تنظیم «تعداد مقاله در هر صفحه» که مخصوص صفحه‌ی اصلیه.
const PER_PAGE = 10;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { articles, total, perPage } = q
    ? await searchArticles(q, page, PER_PAGE)
    : category
      ? await getArticlesByCategory(category, page, PER_PAGE)
      : await getAllArticles(page, PER_PAGE);

  const heading = q ? `نتیجه‌ی جست‌وجو برای «${q}»` : category ? category : "آرشیو مقاله‌ها";
  const basePath = "/articles";
  const linkParams = { q, category };

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_4fr]">
        <div className="hidden min-w-0 sm:block">
          <Sidebar query={q} />
        </div>
        <div className="sm:pl-[1.5cm]">
          <h1 className="mb-10 text-3xl font-bold">{heading}</h1>
          {articles.length > 0 ? (
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
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
