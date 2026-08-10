-- این فایل رو بعد از settings-v3.sql، یک‌بار توی SQL Editor اجرا کنید.
-- روشن/خاموش‌کردن نمایش «معرفی کوتاه» توی سایدبار رو اضافه می‌کنه.
-- پیش‌فرض false گذاشته شده تا معرفی فعلی، تا وقتی خودتون تیک بزنید، نمایش داده نشه.

alter table site_settings
  add column if not exists bio_enabled boolean not null default false;
