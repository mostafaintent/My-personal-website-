import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import CategorySidebar from "@/components/CategorySidebar";
import { getAllArticles, getArticlesByCategory, searchArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";
export const metadata = { title: "مقاله‌ها" };

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const articles = q
    ? await searchArticles(q)
    : category
      ? await getArticlesByCategory(category)
      : await getAllArticles();

  const heading = q ? `نتیجه‌ی جست‌وجو برای «${q}»` : category ? category : "آرشیو مقاله‌ها";

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_240px]">
        <div>
          <h1 className="font-display mb-10 text-3xl font-bold">{heading}</h1>
          {articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : (
            <p className="text-muted">چیزی پیدا نشد.</p>
          )}
        </div>
        <CategorySidebar query={q} />
      </div>
    </Container>
  );
}
