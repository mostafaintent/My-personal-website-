import SettingsForm from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/lib/actions/settings";
import { getSiteSettings } from "@/lib/settings";

export const metadata = { title: "ظاهر سایت" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">ظاهر سایت</h1>
      <SettingsForm
        action={updateSiteSettings}
        initialSiteName={settings.siteName}
        initialBio={settings.bio}
        initialItemsPerPage={settings.itemsPerPage}
        initialFavoriteReads={settings.favoriteReads}
        error={error}
        message={message}
      />
    </div>
  );
}
