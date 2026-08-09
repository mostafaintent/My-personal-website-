import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/articles", label: "مقالات" },
  { href: "/admin/comments", label: "نظرات" },
  { href: "/admin/access", label: "دسترسی‌ها" },
  { href: "/admin/settings", label: "ظاهر سایت" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <Container wide className="py-14">
      <div className="grid gap-10 sm:grid-cols-[1fr_180px]">
        <div>{children}</div>
        <nav className="order-first sm:order-last">
          <Link
            href="/"
            className="mb-6 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
          >
            <ArrowRight size={14} />
            بازگشت به سایت
          </Link>
          <p className="mb-3 text-xs font-medium text-muted">مدیریت</p>
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-background-soft"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Container>
  );
}
