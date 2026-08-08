import Container from "@/components/Container";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "درباره",
};

export default function AboutPage() {
  return (
    <Container narrow className="py-14">
      <h1 className="font-display mb-8 text-3xl font-bold">درباره‌ی {siteConfig.authorName}</h1>
      <div className="prose-article">
        <p>{siteConfig.authorBio}</p>
        <p>
          این بخش قابل ویرایشه — کافیه محتوای این صفحه رو با شرح‌حال واقعی
          خودتون جایگزین کنید. فایل مربوطه: <code>app/about/page.tsx</code>.
        </p>
      </div>
    </Container>
  );
}
