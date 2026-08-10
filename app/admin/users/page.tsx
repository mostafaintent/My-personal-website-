import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatJalaliDate } from "@/lib/format";

export const metadata = { title: "کاربران" };

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers(),
    supabase.from("profiles").select("id, display_name, role, created_at"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const users = (authData?.users ?? [])
    .map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "—",
        displayName: profile?.display_name || "بدون نام",
        role: profile?.role ?? "reader",
        createdAt: profile?.created_at ?? u.created_at,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">کاربران</h1>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {users.length > 0 ? (
          users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 bg-card p-4">
              <div>
                <p className="font-medium">
                  {u.displayName}{" "}
                  {u.role === "admin" && <span className="text-xs text-accent">(ادمین)</span>}
                </p>
                <p className="text-xs text-muted">
                  {u.email} · عضویت از {formatJalaliDate(u.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="bg-card p-6 text-center text-sm text-muted">هنوز کاربری ثبت‌نام نکرده.</p>
        )}
      </div>
    </div>
  );
}
