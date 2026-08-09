import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/settings";
import Container from "./Container";

export default async function Footer() {
  const settings = await getSiteSettings();

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
        <p>{settings.siteName} — تمام مقاله‌های رایگان اینجا با عشق نوشته می‌شن.</p>
      </Container>
    </footer>
  );
}
