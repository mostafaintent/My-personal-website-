import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-10">
      <Container className="flex flex-col items-center gap-4 text-center text-sm text-muted">
        <div className="flex gap-5">
          {siteConfig.social.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p>
          {siteConfig.name} — تمام مقاله‌های رایگان اینجا با عشق نوشته می‌شن.{" "}
          <Link href="/support" className="text-accent hover:underline">
            حمایت از این پروژه
          </Link>
        </p>
      </Container>
    </footer>
  );
}
