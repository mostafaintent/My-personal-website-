import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import { updateArticle } from "@/lib/actions/articles";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "ویرایش مقاله" };

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();

  if (!article) notFound();

  const updateWithId = updateArticle.bind(null, id);

  return (
    <div>
      <h1 className="font-display mb-8 text-3xl font-bold">ویرایش مقاله</h1>
      <ArticleForm action={updateWithId} defaultValues={article} error={error} />
    </div>
  );
}
