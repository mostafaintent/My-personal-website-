"use client";

import { toggleCommentVisibility, deleteCommentAdmin } from "@/lib/actions/comments";

export default function CommentModerationRow({
  id,
  body,
  status,
  date,
  articleTitle,
  authorName,
}: {
  id: string;
  body: string;
  status: "visible" | "hidden";
  date: string;
  articleTitle: string;
  authorName: string;
}) {
  return (
    <div className="bg-card p-4">
      <p className="text-xs text-muted">
        {authorName} · زیر «{articleTitle}» · {date} ·{" "}
        {status === "visible" ? "نمایش داده می‌شود" : "مخفی است"}
      </p>
      <p className="mt-2 text-sm">{body}</p>
      <div className="mt-3 flex gap-3 text-xs">
        <button
          type="button"
          className="text-accent hover:underline"
          onClick={() => toggleCommentVisibility(id, status === "visible" ? "hidden" : "visible")}
        >
          {status === "visible" ? "مخفی کردن" : "نمایش دادن"}
        </button>
        <button
          type="button"
          className="text-muted hover:text-accent"
          onClick={() => {
            if (confirm("این نظر حذف بشه؟")) deleteCommentAdmin(id);
          }}
        >
          حذف
        </button>
      </div>
    </div>
  );
}
