import { createClient } from "@/lib/supabase/client";

const BUCKET = "article-images";
const SITE_ASSETS_BUCKET = "site-assets";

async function uploadTo(bucket: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadArticleImage(file: File): Promise<string> {
  return uploadTo(BUCKET, file);
}

export async function uploadSiteImage(file: File): Promise<string> {
  return uploadTo(SITE_ASSETS_BUCKET, file);
}
