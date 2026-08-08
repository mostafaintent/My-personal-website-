import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { id: user.id, email: user.email ?? null, profile: profile ?? null };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const current = await getCurrentUser();
  if (!current || current.profile?.role !== "admin") {
    redirect("/login?error=" + encodeURIComponent("این بخش فقط برای مدیر سایت است"));
  }
  return current;
}
