// منطق رتبه‌بندیِ «مطالب مرتبط» جدا از کوئری Supabase نگه داشته شده تا
// بدون نیاز به دیتابیس قابل تست باشه. الگوریتم: اول تگ مشترک، بعد
// دسته‌ی مشترک، و در آخر تازگی فقط به‌عنوان tie-breaker.
export interface RelatedCandidate {
  id: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

export function rankRelatedCandidates<T extends RelatedCandidate>(
  current: { id: string; category: string; tags: string[] },
  candidates: T[],
  limit = 3
): T[] {
  const currentTags = new Set(current.tags);

  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({
      candidate,
      tagOverlap: candidate.tags.filter((tag) => currentTags.has(tag)).length,
      sameCategory: candidate.category === current.category,
    }))
    .sort((a, b) => {
      if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
      if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
      return b.candidate.publishedAt.localeCompare(a.candidate.publishedAt);
    })
    .slice(0, limit)
    .map((ranked) => ranked.candidate);
}
