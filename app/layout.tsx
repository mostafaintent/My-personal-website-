import type { Metadata } from "next";
import {
  Vazirmatn,
  Noto_Naskh_Arabic,
  Tajawal,
  Noto_Sans_Arabic,
  IBM_Plex_Sans_Arabic,
  Lalezar,
} from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

// میترا/یکان/زار فونت‌های مالکیت‌دار (غیررایگان) هستن و امکان جاسازی
// قانونیشون توی وب نیست؛ این‌ها معادل‌های آزاد و رایگانِ نزدیک بهشون‌ان.
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic", "latin"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const lalezar = Lalezar({
  variable: "--font-lalezar",
  subsets: ["arabic", "latin"],
  weight: ["400"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.siteName,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.bio,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${notoNaskh.variable} ${tajawal.variable} ${notoSansArabic.variable} ${ibmPlexSansArabic.variable} ${lalezar.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
