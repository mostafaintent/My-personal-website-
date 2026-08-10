import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import Sidebar from "./Sidebar";
import MobileNavDrawer from "./MobileNavDrawer";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header>
      <div
        className="relative text-center"
        style={{ marginTop: "0.5cm", marginBottom: "1cm", marginInline: "2cm" }}
      >
        <MobileNavDrawer>
          <Sidebar />
        </MobileNavDrawer>
        <Link href="/" className="inline-block">
          {settings.bannerImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.bannerImageUrl}
              alt={settings.siteName}
              className="mx-auto w-full object-cover"
              style={{ maxHeight: "200px" }}
            />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {settings.siteName}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
