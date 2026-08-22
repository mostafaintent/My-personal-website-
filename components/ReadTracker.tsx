"use client";

import { useEffect, useRef } from "react";
import { markArticleRead } from "@/lib/actions/interactions";

// یک نشانگرِ نامرئی که باید درست بعد از پایان متنِ مقاله رندر بشه. وقتی
// این نقطه وارد دیدِ کاربر بشه (یعنی تا انتهای مقاله اسکرول کرده)، مقاله
// یک‌بار به‌عنوان «خوانده‌شده» ثبت می‌شه. صرفِ باز کردن مقاله (View) با
// این (Read) فرق داره.
export default function ReadTracker({ articleId }: { articleId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!fired && entries.some((entry) => entry.isIntersecting)) {
          fired = true;
          markArticleRead(articleId);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [articleId]);

  return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />;
}
