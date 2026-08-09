import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getAllArticles } from "@/lib/articles";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const settings = await getSiteSettings();
  const { articles, total, perPage } = await getAllArticles(page, settings.itemsPerPage);

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_3fr]">
        <div className="order-last sm:order-none">
          <Sidebar />
        </div>
        <div>
          {articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : (
            <p className="text-center text-muted">هنوز مقاله‌ای منتشر نشده.</p>
          )}
          <Pagination total={total} page={page} perPage={perPage} basePath="/" />
        </div>
      </div>
    </Container>
  );
}
