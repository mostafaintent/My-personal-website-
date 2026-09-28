import { describe, expect, it } from "vitest";
import { tagFromRouteParam, tagHref } from "./tags";

describe("tagHref", () => {
  it("builds a /tags/<encoded-tag> url for a simple tag", () => {
    expect(tagHref("فلسفه")).toBe(`/tags/${encodeURIComponent("فلسفه")}`);
  });

  it("trims whitespace before encoding", () => {
    expect(tagHref("  یادداشت  ")).toBe(`/tags/${encodeURIComponent("یادداشت")}`);
  });

  it("safely encodes tags containing special/reserved URL characters", () => {
    const tag = "روان‌شناسی/تحلیلی";
    const href = tagHref(tag);
    expect(href).toBe(`/tags/${encodeURIComponent(tag)}`);
    // یک اسلش وسط تگ نباید یک سگمنت مسیر جدید بسازه.
    expect(href.split("/")).toHaveLength(3); // "", "tags", "<encoded>"
  });
});

describe("tagFromRouteParam", () => {
  it("is the exact inverse of tagHref for round-tripping", () => {
    const original = "فلسفه و تاریخ";
    const encoded = encodeURIComponent(original);
    expect(tagFromRouteParam(encoded)).toBe(original);
  });

  it("trims the decoded value", () => {
    expect(tagFromRouteParam(encodeURIComponent("  عرفان  "))).toBe("عرفان");
  });

  it("returns null (not a throw) for malformed percent-encoding, so the route can 404 instead of 500", () => {
    // یک "%" تنها یا دنباله‌ی ناقص، decodeURIComponent رو با URIError می‌ترکونه.
    expect(tagFromRouteParam("%")).toBeNull();
    expect(tagFromRouteParam("%E0%A4%A")).toBeNull();
    expect(() => tagFromRouteParam("%")).not.toThrow();
  });

  it("returns null for an empty or whitespace-only slug", () => {
    expect(tagFromRouteParam("")).toBeNull();
    expect(tagFromRouteParam(encodeURIComponent("   "))).toBeNull();
  });
});
