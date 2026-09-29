import { describe, expect, it } from "vitest";
import {
  bucketByDay,
  calcPercentChange,
  countByKey,
  countTagFrequency,
  findArticlesNeedingAttention,
  groupByDayFromTimestamps,
  matchArticlePathToSlug,
  splitWeeks,
  topNByCount,
} from "./admin-insights";

describe("calcPercentChange", () => {
  it("computes a positive percentage increase", () => {
    expect(calcPercentChange(120, 100)).toBe(20);
  });

  it("computes a negative percentage decrease", () => {
    expect(calcPercentChange(80, 100)).toBe(-20);
  });

  it("returns null when the previous period was zero (undefined percentage)", () => {
    expect(calcPercentChange(5, 0)).toBeNull();
    expect(calcPercentChange(0, 0)).toBeNull();
  });
});

describe("bucketByDay", () => {
  it("produces exactly `days` buckets including empty days, oldest first", () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const buckets = bucketByDay([], 14, now);
    expect(buckets).toHaveLength(14);
    expect(buckets[0].date).toBe("2026-01-02");
    expect(buckets[13].date).toBe("2026-01-15");
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });

  it("counts timestamps into their correct day bucket", () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const timestamps = [
      "2026-01-15T08:00:00.000Z",
      "2026-01-15T20:00:00.000Z",
      "2026-01-14T01:00:00.000Z",
    ];
    const buckets = bucketByDay(timestamps, 14, now);
    const byDate = new Map(buckets.map((b) => [b.date, b.count]));
    expect(byDate.get("2026-01-15")).toBe(2);
    expect(byDate.get("2026-01-14")).toBe(1);
  });

  it("ignores timestamps outside the requested window", () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const buckets = bucketByDay(["2025-01-01T00:00:00.000Z"], 14, now);
    expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(0);
  });
});

describe("splitWeeks", () => {
  it("splits 14 daily buckets into last-week and this-week sums", () => {
    const daily = Array.from({ length: 14 }, (_, i) => ({
      date: `day-${i}`,
      count: i < 7 ? 1 : 2, // اول ۷ تا هفتهٔ قبل (۱ تایی)، بعدی هفتهٔ اخیر (۲ تایی)
    }));
    expect(splitWeeks(daily)).toEqual({ lastWeek: 7, thisWeek: 14 });
  });
});

describe("groupByDayFromTimestamps", () => {
  it("only includes days that actually have data, sorted ascending", () => {
    const result = groupByDayFromTimestamps([
      "2026-01-03T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
      "2026-01-01T12:00:00.000Z",
    ]);
    expect(result).toEqual([
      { date: "2026-01-01", count: 2 },
      { date: "2026-01-03", count: 1 },
    ]);
  });

  it("caps the result to the most recent maxBuckets days", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const timestamps = Array.from({ length: 40 }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      return d.toISOString();
    });
    const result = groupByDayFromTimestamps(timestamps, 30);
    expect(result).toHaveLength(30);
    expect(result[result.length - 1].date).toBe(timestamps[39].slice(0, 10));
  });

  it("returns an empty array for no data", () => {
    expect(groupByDayFromTimestamps([])).toEqual([]);
  });
});

describe("matchArticlePathToSlug", () => {
  const slugs = new Set(["فلسفه-و-زندگی", "plain-slug"]);

  it("matches a raw (already-decoded) slug in the path", () => {
    expect(matchArticlePathToSlug("/articles/فلسفه-و-زندگی", slugs)).toBe("فلسفه-و-زندگی");
  });

  it("matches a percent-encoded slug in the path", () => {
    const encoded = `/articles/${encodeURIComponent("فلسفه-و-زندگی")}`;
    expect(matchArticlePathToSlug(encoded, slugs)).toBe("فلسفه-و-زندگی");
  });

  it("returns null for paths outside /articles/", () => {
    expect(matchArticlePathToSlug("/about", slugs)).toBeNull();
    expect(matchArticlePathToSlug("/tags/فلسفه", slugs)).toBeNull();
  });

  it("returns null (never throws) for malformed percent-encoding", () => {
    expect(() => matchArticlePathToSlug("/articles/%", slugs)).not.toThrow();
    expect(matchArticlePathToSlug("/articles/%", slugs)).toBeNull();
  });

  it("returns null for a slug that no longer exists", () => {
    expect(matchArticlePathToSlug("/articles/deleted-article", slugs)).toBeNull();
  });
});

describe("countTagFrequency", () => {
  it("counts and sorts tags by frequency, descending", () => {
    const result = countTagFrequency([
      ["فلسفه", "اخلاق"],
      ["فلسفه"],
      ["تاریخ"],
    ]);
    expect(result[0]).toEqual({ tag: "فلسفه", count: 2 });
    expect(result.map((r) => r.tag)).toContain("اخلاق");
    expect(result.map((r) => r.tag)).toContain("تاریخ");
  });

  it("returns an empty array when no articles have tags", () => {
    expect(countTagFrequency([[], []])).toEqual([]);
  });
});

describe("findArticlesNeedingAttention", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");

  it("flags a draft untouched for more than 14 days", () => {
    const items = findArticlesNeedingAttention(
      [
        {
          id: "1",
          slug: "s1",
          title: "t1",
          status: "draft",
          excerpt: "",
          coverImageUrl: null,
          tags: [],
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      now
    );
    expect(items).toEqual([{ id: "1", slug: "s1", title: "t1", reason: "stale_draft" }]);
  });

  it("does not flag a recent draft, even with no excerpt/cover/tags", () => {
    const items = findArticlesNeedingAttention(
      [
        {
          id: "1",
          slug: "s1",
          title: "t1",
          status: "draft",
          excerpt: "",
          coverImageUrl: null,
          tags: [],
          updatedAt: "2026-01-30T00:00:00.000Z",
        },
      ],
      now
    );
    expect(items).toEqual([]);
  });

  it("flags a published article missing excerpt, cover, and tags — all three", () => {
    const items = findArticlesNeedingAttention(
      [
        {
          id: "1",
          slug: "s1",
          title: "t1",
          status: "published",
          excerpt: "",
          coverImageUrl: null,
          tags: [],
          updatedAt: "2026-01-30T00:00:00.000Z",
        },
      ],
      now
    );
    expect(items.map((i) => i.reason).sort()).toEqual(
      ["missing_cover", "missing_excerpt", "missing_tags"].sort()
    );
  });

  it("treats an excerpt containing only empty HTML tags as empty", () => {
    const items = findArticlesNeedingAttention(
      [
        {
          id: "1",
          slug: "s1",
          title: "t1",
          status: "published",
          excerpt: "<p></p>",
          coverImageUrl: "https://example.com/cover.jpg",
          tags: ["فلسفه"],
          updatedAt: "2026-01-30T00:00:00.000Z",
        },
      ],
      now
    );
    expect(items).toEqual([{ id: "1", slug: "s1", title: "t1", reason: "missing_excerpt" }]);
  });

  it("does not flag a complete published article", () => {
    const items = findArticlesNeedingAttention(
      [
        {
          id: "1",
          slug: "s1",
          title: "t1",
          status: "published",
          excerpt: "یک خلاصهٔ واقعی",
          coverImageUrl: "https://example.com/cover.jpg",
          tags: ["فلسفه"],
          updatedAt: "2026-01-30T00:00:00.000Z",
        },
      ],
      now
    );
    expect(items).toEqual([]);
  });
});

describe("countByKey / topNByCount", () => {
  it("counts occurrences and returns the top N descending", () => {
    const counts = countByKey(["a", "b", "a", "a", "c", "b"]);
    expect(topNByCount(counts, 2)).toEqual([
      { key: "a", count: 3 },
      { key: "b", count: 2 },
    ]);
  });
});
