import Container from "@/components/Container";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "درباره",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <Container narrow className="py-14">
      <h1 className="mb-8 text-3xl font-bold">درباره‌ی {settings.authorName}</h1>
      <div className="prose-article">
        <p>{settings.bio}</p>
        <p>
          این بخش قابل ویرایشه — کافیه محتوای این صفحه رو با شرح‌حال واقعی
          خودتون جایگزین کنید. فایل مربوطه: <code>app/about/page.tsx</code>.
        </p>
      </div>
    </Container>
  );
}
