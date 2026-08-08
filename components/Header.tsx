import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import Container from "./Container";

export default function Header() {
  return (
    <header className="border-b border-border">
      <Container className="flex flex-col items-center gap-3 py-10 text-center">
        <Link
          href="/"
          className="font-display text-3xl font-bold tracking-tight text-foreground"
        >
          {siteConfig.name}
        </Link>
        <p className="max-w-md text-sm leading-7 text-muted">
          {siteConfig.tagline}
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
