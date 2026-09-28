import { describe, expect, it } from "vitest";
import RelatedArticles from "./RelatedArticles";
import type { ArticleMeta } from "@/lib/articles";

function meta(overrides: Partial<ArticleMeta> = {}): ArticleMeta {
  return {
    id: "1",
    slug: "slug",
    title: "عنوان",
    excerpt: "",
    category: "یادداشت",
    tags: [],
    premium: false,
    publishedAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    readingMinutes: 3,
    coverImageUrl: null,
    ...overrides,
  };
}

describe("RelatedArticles", () => {
  it("renders nothing when there are no related articles", () => {
    expect(RelatedArticles({ articles: [] })).toBeNull();
  });

  it("renders a section when there are related articles", () => {
    const result = RelatedArticles({ articles: [meta()] });
    expect(result).not.toBeNull();
  });
});
