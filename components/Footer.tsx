import { getSiteSettings } from "@/lib/settings";
import Container from "./Container";

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-24 border-t border-border py-10">
      <Container className="flex flex-col items-center gap-4 text-center text-sm text-muted">
        {settings.socialLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5">
            {settings.socialLinks.map((link, i) => (
              <a key={i} href={link.url} className="transition-colors hover:text-accent">
                {link.label}
              </a>
            ))}
          </div>
        )}
        <p>
          {settings.siteName}
          {settings.footerNote && ` — ${settings.footerNote}`}
        </p>
      </Container>
    </footer>
  );
}
