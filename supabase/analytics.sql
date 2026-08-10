-- این فایل رو یک‌بار توی SQL Editor اجرا کنید.
-- جدول ساده‌ای برای شمارش بازدید صفحات سایت می‌سازه، تا آمار ورودی
-- مستقیم توی داشبورد خودِ پنل مدیریت (نه فقط داشبورد Vercel) دیده بشه.
-- فقط مسیر صفحه و زمان ثبت می‌شه — هیچ آی‌پی یا اطلاعات شخصی ذخیره نمی‌شه.

create table page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on page_views (created_at desc);

alter table page_views enable row level security;

-- درج فقط از طریق کلید service role (سرور خودِ سایت) انجام می‌شه، برای
-- همین سیاست insert جداگانه‌ای لازم نیست — بقیه (کاربر عادی/ناشناس)
-- اصلاً اجازه‌ی نوشتن یا خوندن این جدول رو ندارن.
create policy "فقط ادمین بازدیدها رو می‌بینه"
  on page_views for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
