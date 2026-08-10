import Container from "@/components/Container";
import ArticleFullCard from "@/components/ArticleFullCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getAllArticlesFull } from "@/lib/articles";
import { getSiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getUnlockedMap } from "@/lib/payments/access";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [settings, current] = await Promise.all([getSiteSettings(), getCurrentUser()]);
  const { articles, total, perPage } = await getAllArticlesFull(page, settings.itemsPerPage);
  const unlockedMap = await getUnlockedMap(current?.id ?? null, articles);

  return (
    <Container wide className="pb-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_4fr]">
        <div className="hidden min-w-0 sm:block">
          <Sidebar />
        </div>
        <div className="sm:pl-[1.5cm]">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleFullCard
                key={article.slug}
                article={article}
                authorName={settings.authorName}
                unlocked={unlockedMap[article.id] ?? false}
                isLoggedIn={Boolean(current)}
              />
            ))
          ) : (
            <p className="text-center text-muted">هنوز مقاله‌ای منتشر نشده.</p>
          )}
          <Pagination total={total} page={page} perPage={perPage} basePath="/" />
        </div>
      </div>
    </Container>
  );
}
