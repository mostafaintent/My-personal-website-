import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { postComment } from "@/lib/actions/comments";
import { formatJalaliDate } from "@/lib/format";

export default async function Comments({
  articleId,
  articleSlug,
}: {
  articleId: string;
  articleSlug: string;
}) {
  const current = await getCurrentUser();
  const supabase = await createClient();

  const { data: commentsData } = await supabase
    .from("comments")
    .select("id, body, created_at, author:profiles(display_name)")
    .eq("article_id", articleId)
    .eq("status", "visible")
    .order("created_at", { ascending: true });
  const comments = commentsData as unknown as
    | { id: string; body: string; created_at: string; author: { display_name: string } | null }[]
    | null;

  const postWithIds = postComment.bind(null, articleSlug, articleId);

  return (
    <section className="mt-16">
      <h2 className="font-display mb-6 text-xl font-bold">نظرات</h2>

      {current ? (
        <form action={postWithIds} className="mb-8 flex flex-col gap-3">
          <textarea
            name="body"
            required
            rows={3}
            placeholder="نظرتان را بنویسید..."
            className="rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            ارسال نظر
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted">
          برای ثبت نظر{" "}
          <Link href="/login" className="text-accent hover:underline">
            وارد حساب
          </Link>{" "}
          شوید.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {comments && comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">
                {c.author?.display_name ?? "کاربر"} ·{" "}
                {formatJalaliDate(c.created_at)}
              </p>
              <p className="mt-2 text-sm leading-7">{c.body}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">هنوز نظری ثبت نشده — اولین نفر باشید.</p>
        )}
      </div>
    </section>
  );
}
