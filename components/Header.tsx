import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import Container from "./Container";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="border-b border-border bg-background-soft">
      <Container className="py-8 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
          {settings.siteName}
        </Link>
      </Container>
    </header>
  );
}
