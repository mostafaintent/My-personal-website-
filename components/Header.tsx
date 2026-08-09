import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import Container from "./Container";
import Sidebar from "./Sidebar";
import MobileNavDrawer from "./MobileNavDrawer";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="border-b border-border bg-background-soft">
      <Container className="relative py-8 text-center">
        <MobileNavDrawer>
          <Sidebar />
        </MobileNavDrawer>
        <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-foreground">
          {settings.bannerImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.bannerImageUrl}
              alt={settings.siteName}
              className="mx-auto max-h-24 w-auto object-contain"
            />
          ) : (
            settings.siteName
          )}
        </Link>
      </Container>
    </header>
  );
}
