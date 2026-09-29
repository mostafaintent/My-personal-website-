import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { stripHtmlToText } from "@/lib/sanitize";

// این Route Handler زیر app/admin/ است ولی مثل صفحه‌ها از app/admin/layout.tsx
// عبور نمی‌کنه (layoutها فقط روی page اعمال می‌شن، نه route handler) — برای
// همین requireAdmin() اینجا صریحاً و مستقل فراخوانی می‌شه، وگرنه این مسیر
// کاملاً عمومی می‌موند.
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, title, excerpt, category, tags, published_at, content")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: stripHtmlToText(row.excerpt),
    category: row.category,
    tags: row.tags,
    publishedAt: row.published_at,
    bodyText: stripHtmlToText(row.content),
  }));

  return new NextResponse(JSON.stringify(articles, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="articles-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
