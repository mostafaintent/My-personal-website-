import ArticleForm from "@/components/admin/ArticleForm";
import { createArticle } from "@/lib/actions/articles";

export const metadata = { title: "مقاله جدید" };

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="font-display mb-8 text-3xl font-bold">مقاله‌ی جدید</h1>
      <ArticleForm action={createArticle} error={error} />
    </div>
  );
}
