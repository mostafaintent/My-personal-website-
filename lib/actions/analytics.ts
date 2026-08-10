"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function logPageView(path: string) {
  if (path.startsWith("/admin")) return;
  const admin = createAdminClient();
  await admin.from("page_views").insert({ path });
}
