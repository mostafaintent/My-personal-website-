import SettingsForm from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/lib/actions/settings";
import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "ظاهر سایت" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const settings = await getSiteSettings();

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, cover_image_url")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">ظاهر سایت</h1>
      <SettingsForm
        action={updateSiteSettings}
        initialSiteName={settings.siteName}
        initialAuthorName={settings.authorName}
        initialBio={settings.bio}
        initialItemsPerPage={settings.itemsPerPage}
        initialFavoriteSlugs={settings.favoriteSlugs}
        initialBannerImageUrl={settings.bannerImageUrl}
        initialShareLinks={settings.shareLinks}
        initialSocialLinks={settings.socialLinks}
        initialFooterNote={settings.footerNote}
        articles={(articles ?? []).map((a) => ({
          slug: a.slug,
          title: a.title,
          imageUrl: a.cover_image_url ?? "",
        }))}
        error={error}
        message={message}
      />
    </div>
  );
}
