import { describe, expect, it, vi } from "vitest";

// یک fake ساده برای query builder زنجیره‌ایِ supabase-js: هر متد فراخوانی رو
// ثبت می‌کنه و خودش رو برمی‌گردونه (چون این متدها روی خودِ builder چین می‌شن)،
// و در نهایت با await شدن (یا .then) به نتیجه‌ی از پیش‌تعیین‌شده resolve می‌شه.
function createFakeQuery(result: { data: unknown[] | null; count?: number | null }) {
  const calls: { method: string; args: unknown[] }[] = [];
  const builder: Record<string, unknown> = { __calls: calls };

  ["select", "eq", "neq", "contains", "overlaps", "order", "range", "limit"].forEach((method) => {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };
  });

  builder.then = (resolve: (value: typeof result) => unknown) => resolve(result);
  return builder;
}

const { fakeFrom } = vi.hoisted(() => ({ fakeFrom: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: fakeFrom }),
}));

const { getArticlesByTag, getPublishedArticlesForSitemap } = await import("./articles");

function articleRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    slug: "test-slug",
    title: "عنوان",
    excerpt: "",
    content: "<p>متن</p>",
    category: "یادداشت",
    tags: ["الف"],
    premium: false,
    price_usd: null,
    price_irr: null,
    cover_image_url: null,
    status: "published",
    author_id: null,
    published_at: "2026-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getArticlesByTag", () => {
  it("filters by published status and the given tag, with correct pagination range", async () => {
    const query = createFakeQuery({ data: [articleRow()], count: 1 });
    fakeFrom.mockReturnValue(query);

    const result = await getArticlesByTag("الف", 2, 10);

    const calls = (query.__calls as { method: string; args: unknown[] }[]).map((c) => c);
    expect(calls).toContainEqual({ method: "eq", args: ["status", "published"] });
    expect(calls).toContainEqual({ method: "contains", args: ["tags", ["الف"]] });
    // صفحه‌ی ۲ با ۱۰ آیتم در هر صفحه → ردیف‌های ۱۰ تا ۱۹.
    expect(calls).toContainEqual({ method: "range", args: [10, 19] });
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(10);
    expect(result.articles[0].slug).toBe("test-slug");
  });
});

describe("getPublishedArticlesForSitemap", () => {
  it("only queries published articles (drafts excluded)", async () => {
    const query = createFakeQuery({
      data: [{ slug: "a", updated_at: "2026-01-01T00:00:00.000Z" }],
    });
    fakeFrom.mockReturnValue(query);

    const result = await getPublishedArticlesForSitemap();

    const calls = (query.__calls as { method: string; args: unknown[] }[]).map((c) => c);
    expect(calls).toContainEqual({ method: "eq", args: ["status", "published"] });
    expect(result).toEqual([{ slug: "a", updatedAt: "2026-01-01T00:00:00.000Z" }]);
  });
});
