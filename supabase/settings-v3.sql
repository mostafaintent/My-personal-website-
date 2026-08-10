-- این فایل رو بعد از settings-v2.sql، یک‌بار توی SQL Editor اجرا کنید.
-- لینک‌های شبکه‌های اجتماعی پایین سایت (تلگرام/ایمیل/اینستاگرام و...) و
-- متن کوتاه پاورقی رو قابل‌ویرایش می‌کنه.

alter table site_settings
  add column if not exists social_links jsonb not null default
    '[{"label":"ایمیل","url":"#"},{"label":"تلگرام","url":"#"},{"label":"اینستاگرام","url":"#"}]'::jsonb,
  add column if not exists footer_note text not null default 'تمام مقاله‌های رایگان اینجا با عشق نوشته می‌شن.';
