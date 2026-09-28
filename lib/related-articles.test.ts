import { describe, expect, it } from "vitest";
import { rankRelatedCandidates, type RelatedCandidate } from "./related-articles";

const current = { id: "current", category: "فلسفه", tags: ["نیچه", "اخلاق"] };

function candidate(overrides: Partial<RelatedCandidate>): RelatedCandidate {
  return {
    id: "x",
    category: "فلسفه",
    tags: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("rankRelatedCandidates", () => {
  it("excludes the current article even if it appears in the candidate list", () => {
    const candidates = [
      candidate({ id: "current", tags: ["نیچه"] }),
      candidate({ id: "other", tags: ["نیچه"] }),
    ];
    const result = rankRelatedCandidates(current, candidates);
    expect(result.map((c) => c.id)).toEqual(["other"]);
  });

  it("ranks a shared-tag article above a same-category-only article", () => {
    const sameCategoryOnly = candidate({ id: "cat-only", category: "فلسفه", tags: [] });
    const sharedTag = candidate({ id: "tag-match", category: "تاریخ", tags: ["نیچه"] });
    const result = rankRelatedCandidates(current, [sameCategoryOnly, sharedTag]);
    expect(result[0].id).toBe("tag-match");
  });

  it("uses recency only as a tie-breaker when tag overlap and category are equal", () => {
    const older = candidate({ id: "older", tags: ["نیچه"], publishedAt: "2026-01-01T00:00:00.000Z" });
    const newer = candidate({ id: "newer", tags: ["نیچه"], publishedAt: "2026-06-01T00:00:00.000Z" });
    const result = rankRelatedCandidates(current, [older, newer]);
    expect(result.map((c) => c.id)).toEqual(["newer", "older"]);
  });

  it("prefers more shared tags over fewer, regardless of recency", () => {
    const oneTagButNewer = candidate({
      id: "one-tag",
      tags: ["نیچه"],
      publishedAt: "2026-06-01T00:00:00.000Z",
    });
    const twoTagsButOlder = candidate({
      id: "two-tags",
      tags: ["نیچه", "اخلاق"],
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
    const result = rankRelatedCandidates(current, [oneTagButNewer, twoTagsButOlder]);
    expect(result[0].id).toBe("two-tags");
  });

  it("respects the limit", () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      candidate({ id: `c${i}`, tags: ["نیچه"] })
    );
    expect(rankRelatedCandidates(current, candidates, 3)).toHaveLength(3);
  });

  it("returns an empty array when there are no candidates", () => {
    expect(rankRelatedCandidates(current, [])).toEqual([]);
  });
});
