"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark } from "lucide-react";
import { toggleFavorite, toggleLike } from "@/lib/actions/interactions";

export default function ArticleInteractions({
  articleId,
  articleSlug,
  isLoggedIn,
  initialLiked,
  initialFavorited,
  likeCount,
}: {
  articleId: string;
  articleSlug: string;
  isLoggedIn: boolean;
  initialLiked: boolean;
  initialFavorited: boolean;
  likeCount: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(likeCount);

  const requireLogin = () => {
    router.push(`/login?error=${encodeURIComponent("برای این کار باید وارد حساب شوید")}`);
  };

  const handleLike = () => {
    if (!isLoggedIn) return requireLogin();
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    startTransition(() => {
      toggleLike(articleId, articleSlug);
    });
  };

  const handleFavorite = () => {
    if (!isLoggedIn) return requireLogin();
    const next = !favorited;
    setFavorited(next);
    startTransition(() => {
      toggleFavorite(articleId, articleSlug);
    });
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <button
        type="button"
        onClick={handleLike}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition-colors ${
          liked ? "border-accent text-accent" : "border-border text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <Heart size={16} fill={liked ? "currentColor" : "none"} />
        {liked ? "پسندیده‌اید" : "پسندیدن"} · {count.toLocaleString("fa-IR")}
      </button>
      <button
        type="button"
        onClick={handleFavorite}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition-colors ${
          favorited ? "border-accent text-accent" : "border-border text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <Bookmark size={16} fill={favorited ? "currentColor" : "none"} />
        {favorited ? "ذخیره‌شده" : "ذخیره برای بعد"}
      </button>
    </div>
  );
}
