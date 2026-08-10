-- این فایل رو یک‌بار توی Supabase Dashboard -> SQL Editor اجرا کنید تا
-- دسته‌بندی مقالات به‌جای لیست ثابت (enum)، از یک جدول قابل‌مدیریت بیاد —
-- تا بشه از پنل ادمین دسته‌ی جدید اضافه کرد، حذف کرد، اسمش رو عوض کرد یا
-- یک مقاله رو از دسته‌ای به دسته‌ی دیگه جابه‌جا کرد.

-- ستون category مقاله‌ها قبلاً از نوع enum ثابت بود؛ به متن آزاد تبدیلش
-- می‌کنیم چون دیگه لیست دسته‌ها از دیتابیس میاد نه از کد.
alter table articles alter column category type text;
drop type if exists article_category;

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- همون ۷ دسته‌ی قبلی رو با ترتیب فعلی‌شون منتقل می‌کنیم تا چیزی برای
-- مقاله‌های موجود عوض نشه.
insert into categories (name, sort_order) values
  ('یادداشت', 0),
  ('ادبیات', 1),
  ('فلسفه', 2),
  ('روان‌شناسی', 3),
  ('تاریخ', 4),
  ('عرفان', 5),
  ('ترجمه', 6);

alter table categories enable row level security;

create policy "دسته‌بندی‌ها برای همه قابل خوندنه"
  on categories for select using (true);

create policy "فقط ادمین دسته‌بندی مدیریت می‌کنه"
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
