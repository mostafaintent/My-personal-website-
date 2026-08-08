"use client";

import { deleteArticle } from "@/lib/actions/articles";

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  return (
    <button
      type="button"
      className="text-muted hover:text-accent"
      onClick={() => {
        if (confirm("این مقاله حذف بشه؟")) {
          deleteArticle(articleId);
        }
      }}
    >
      حذف
    </button>
  );
}
