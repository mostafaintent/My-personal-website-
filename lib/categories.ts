import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { CategoryRow } from "@/lib/types/database";

// لیست دسته‌بندی‌ها روی خیلی از صفحات (سایدبار، فرم مقاله، آرشیو) خونده
// می‌شه و به‌ندرت عوض می‌شه؛ مثل تنظیمات سایت کش‌ش می‌کنیم.
export const getCategories = unstable_cache(
  async (): Promise<CategoryRow[]> => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["categories"],
  { revalidate: 60, tags: ["categories"] }
);
