-- این فایل رو بعد از settings.sql، یک‌بار توی SQL Editor اجرا کنید.
-- ستون‌های جدید: اسم نویسنده (زیر عنوان مقاله‌ها)، عکس بنر بالای سایت،
-- و لیست لینک‌های اشتراک‌گذاری‌ای که روشن هستن.

alter table site_settings
  add column if not exists author_name text not null default 'بهرام نصیری',
  add column if not exists banner_image_url text not null default '',
  add column if not exists share_links jsonb not null default '["print","email","telegram","whatsapp","x","copy"]'::jsonb;
