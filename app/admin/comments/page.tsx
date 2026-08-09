import { createClient } from "@/lib/supabase/server";
import { formatJalaliDate } from "@/lib/format";
import CommentModerationRow from "@/components/admin/CommentModerationRow";

export const metadata = { title: "نظرات" };

export default async function AdminCommentsPage() {
  const supabase = await createClient();
  const { data: commentsData } = await supabase
    .from("comments")
    .select("id, body, status, created_at, article:articles(title), author:profiles(display_name)")
    .order("created_at", { ascending: false });
  const comments = commentsData as unknown as
    | {
        id: string;
        body: string;
        status: "visible" | "hidden";
        created_at: string;
        article: { title: string } | null;
        author: { display_name: string } | null;
      }[]
    | null;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">نظرات</h1>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {comments && comments.length > 0 ? (
          comments.map((c) => (
            <CommentModerationRow
              key={c.id}
              id={c.id}
              body={c.body}
              status={c.status}
              date={formatJalaliDate(c.created_at)}
              articleTitle={c.article?.title ?? ""}
              authorName={c.author?.display_name ?? ""}
            />
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هنوز نظری ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}
