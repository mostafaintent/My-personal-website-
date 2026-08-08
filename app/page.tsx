import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import CategorySidebar from "@/components/CategorySidebar";
import { getAllArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getAllArticles();

  return (
    <Container wide className="py-14">
      <div className="grid gap-12 sm:grid-cols-[1fr_240px]">
        <div>
          {articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : (
            <p className="text-center text-muted">هنوز مقاله‌ای منتشر نشده.</p>
          )}
        </div>
        <CategorySidebar />
      </div>
    </Container>
  );
}
