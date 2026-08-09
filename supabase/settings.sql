-- این فایل رو یک‌بار، بعد از schema.sql و storage.sql، توی SQL Editor اجرا کنید.
-- یه جدول تک‌ردیفی برای تنظیمات ظاهری سایت (نام سایت، معرفی کوتاه، تعداد
-- مقاله در هر صفحه، و لیست «مطالب ویژه» کنار سایدبار) می‌سازه.

create table site_settings (
  id boolean primary key default true,
  constraint single_row check (id),
  site_name text not null default 'نام سایت',
  bio text not null default '',
  items_per_page int not null default 5,
  favorite_reads jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (true)
on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "تنظیمات سایت برای همه قابل خوندنه"
  on site_settings for select using (true);

create policy "فقط ادمین تنظیمات رو تغییر می‌ده"
  on site_settings for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
