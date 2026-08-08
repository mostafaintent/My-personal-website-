import Container from "@/components/Container";
import ArticleCard from "@/components/ArticleCard";
import { getAllArticles } from "@/lib/articles";

export const metadata = {
  title: "مقاله‌ها",
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <Container className="py-14">
      <h1 className="font-display mb-10 text-3xl font-bold">آرشیو مقاله‌ها</h1>
      <div>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Container>
  );
}
