import { describe, expect, it } from "vitest";
import {
  buildArchiveCanonicalAndRobots,
  buildArticleJsonLd,
  buildArticleMetadata,
  buildArticleUrl,
  jsonLdToScriptString,
} from "./seo";

const siteUrl = "https://example.com";

describe("buildArticleUrl", () => {
  it("encodes the slug into the canonical article path", () => {
    expect(buildArticleUrl(siteUrl, "فلسفه و زندگی")).toBe(
      `${siteUrl}/articles/${encodeURIComponent("فلسفه و زندگی")}`
    );
  });
});

describe("buildArticleMetadata", () => {
  it("sets a canonical and Open Graph block from the given data", () => {
    const metadata = buildArticleMetadata({
      title: "عنوان مقاله",
      descriptionText: "توضیح کوتاه",
      siteUrl,
      slug: "article-1",
      coverImageUrl: "https://cdn.example.com/cover.jpg",
      publishedAt: "2026-01-01T00:00:00.000Z",
      authorName: "نویسنده",
    });

    expect(metadata.alternates?.canonical).toBe(`${siteUrl}/articles/article-1`);
    // نوعِ OpenGraph در next یک union است (فقط زیرمجموعه‌ای از حالت‌ها فیلد
    // «type» دارن)، برای همین برای خوندنش در تست باید narrow کنیم.
    const openGraph = metadata.openGraph as { type?: string } | null;
    expect(openGraph?.type).toBe("article");
    expect(metadata.openGraph?.images).toEqual([{ url: "https://cdn.example.com/cover.jpg" }]);
  });

  it("omits the OG image field when there is no cover image (no placeholder)", () => {
    const metadata = buildArticleMetadata({
      title: "عنوان",
      descriptionText: "",
      siteUrl,
      slug: "no-cover",
      coverImageUrl: null,
      publishedAt: "2026-01-01T00:00:00.000Z",
      authorName: "نویسنده",
    });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.description).toBeUndefined();
  });
});

describe("buildArticleJsonLd", () => {
  it("only includes real, provided data — never placeholders", () => {
    const jsonLd = buildArticleJsonLd({
      title: "عنوان مقاله",
      slug: "article-1",
      siteUrl,
      publishedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
      authorName: "نویسنده",
      // descriptionText و coverImageUrl عمداً داده نشدن.
    });

    expect(jsonLd.headline).toBe("عنوان مقاله");
    expect(jsonLd.author).toEqual({ "@type": "Person", name: "نویسنده" });
    expect(jsonLd.datePublished).toBe("2026-01-01T00:00:00.000Z");
    expect(jsonLd.dateModified).toBe("2026-02-01T00:00:00.000Z");
    expect(jsonLd).not.toHaveProperty("description");
    expect(jsonLd).not.toHaveProperty("image");
  });

  it("includes description/image only when they are actually provided", () => {
    const jsonLd = buildArticleJsonLd({
      title: "عنوان",
      slug: "article-2",
      siteUrl,
      descriptionText: "یک توضیح واقعی",
      coverImageUrl: "https://cdn.example.com/cover.jpg",
      publishedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      authorName: "نویسنده",
    });
    expect(jsonLd.description).toBe("یک توضیح واقعی");
    expect(jsonLd.image).toEqual(["https://cdn.example.com/cover.jpg"]);
  });
});

describe("jsonLdToScriptString", () => {
  it("escapes '<' so a title containing </script> cannot break out of the script tag", () => {
    const serialized = jsonLdToScriptString({ headline: "</script><script>alert(1)</script>" });
    // escape کردن خودِ «<» برای جلوگیری از breakout کافیه؛ «>» نیازی به escape نداره.
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });
});

describe("buildArchiveCanonicalAndRobots", () => {
  const basePath = "/articles";

  it("treats the bare archive (no filters) as a normal, indexable page", () => {
    const result = buildArchiveCanonicalAndRobots({ siteUrl, basePath });
    expect(result.canonical).toBe(`${siteUrl}/articles`);
    expect(result.isFilterVariant).toBe(false);
  });

  it("keeps plain pagination (no q/category) indexable with its own canonical", () => {
    const result = buildArchiveCanonicalAndRobots({ siteUrl, basePath, page: "3" });
    expect(result.canonical).toBe(`${siteUrl}/articles?page=3`);
    expect(result.isFilterVariant).toBe(false);
  });

  it("flags a search query (?q=) as a filter variant and canonicalizes to the bare archive", () => {
    const result = buildArchiveCanonicalAndRobots({ siteUrl, basePath, q: "عرفان" });
    expect(result.isFilterVariant).toBe(true);
    expect(result.canonical).toBe(`${siteUrl}/articles`);
  });

  it("flags a category filter as a filter variant and canonicalizes to the bare archive", () => {
    const result = buildArchiveCanonicalAndRobots({ siteUrl, basePath, category: "فلسفه" });
    expect(result.isFilterVariant).toBe(true);
    expect(result.canonical).toBe(`${siteUrl}/articles`);
  });

  it("canonicalizes any filter+pagination combination to the bare archive, not to itself", () => {
    const result = buildArchiveCanonicalAndRobots({
      siteUrl,
      basePath,
      q: "test",
      category: "فلسفه",
      page: "2",
    });
    expect(result.canonical).toBe(`${siteUrl}/articles`);
    expect(result.isFilterVariant).toBe(true);
  });
});
