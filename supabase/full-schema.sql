-- این فایل جایگزینِ یک‌جای همه‌ی فایل‌های SQL قبلیه (schema, settings v1-v4,
-- storage*, categories, analytics, interactions) — برای این‌که راه‌اندازیِ
-- یک پروژه‌ی Supabase خالی و تازه با یک اجرا انجام بشه. کافیه همین یک فایل
-- رو، فقط یک‌بار، توی SQL Editor پروژه‌ی جدید اجرا کنید.

-- ============ enums ============

create type article_status as enum ('draft', 'published');
create type payment_method as enum ('bank_gateway', 'paypal', 'crypto');
create type purchase_status as enum ('pending', 'completed');
create type subscription_plan as enum ('monthly', 'yearly');
create type subscription_status as enum ('active', 'expired', 'canceled');

-- ============ profiles ============
-- هر کاربر Supabase Auth یک ردیف پروفایل متناظر داره (با تریگر پایین ساخته می‌شه).

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'کاربر',
  role text not null default 'reader' check (role in ('reader', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "پروفایل‌ها برای همه قابل خوندنه"
  on profiles for select using (true);

create policy "کاربر فقط پروفایل خودش رو ویرایش می‌کنه"
  on profiles for update using (auth.uid() = id);

-- هر کاربر جدید که ثبت‌نام می‌کنه، خودکار یک ردیف پروفایل می‌گیره.
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============ categories (دسته‌بندی مقالات، قابل‌مدیریت از پنل ادمین) ============

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

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

-- ============ articles ============
-- category یک ستون متنی آزاده (نه enum)؛ لیست دسته‌های معتبر از جدول
-- categories بالا میاد و توی خودِ کد (نه با foreign key دیتابیس) کنترل می‌شه.

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'یادداشت',
  tags text[] not null default '{}',
  premium boolean not null default false,
  price_usd numeric(10, 2),
  price_irr numeric(12, 0),
  cover_image_url text,
  status article_status not null default 'draft',
  author_id uuid references profiles (id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table articles enable row level security;

create policy "مقاله‌های منتشرشده برای همه قابل خوندنه"
  on articles for select using (status = 'published');

create policy "ادمین همه‌ی مقاله‌ها (حتی پیش‌نویس) رو می‌بینه"
  on articles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین مقاله می‌سازه/ویرایش/حذف می‌کنه"
  on articles for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index articles_status_published_at_idx on articles (status, published_at desc);
create index articles_category_idx on articles (category);

-- ============ comments ============

create table comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "نظرات قابل‌نمایش برای همه قابل خوندنه"
  on comments for select using (status = 'visible');

create policy "ادمین همه‌ی نظرات (حتی مخفی) رو می‌بینه"
  on comments for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "کاربر لاگین‌کرده می‌تونه نظر بده"
  on comments for insert with check (auth.uid() = user_id);

create policy "کاربر نظر خودش رو حذف می‌کنه، ادمین همه رو"
  on comments for delete using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "ادمین می‌تونه وضعیت نظر رو تغییر بده (مخفی/نمایش)"
  on comments for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index comments_article_id_idx on comments (article_id, created_at);

-- ============ purchases (خرید تک‌مقاله‌ای یا چندتایی) ============

create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null,
  payment_method payment_method,
  status purchase_status not null default 'pending',
  order_id uuid not null default gen_random_uuid(), -- خریدهای چندتایی که با هم انجام شدن، order_id مشترک دارن
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table purchases enable row level security;

create policy "کاربر فقط خریدهای خودش رو می‌بینه"
  on purchases for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین خرید ثبت/ویرایش می‌کنه"
  on purchases for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین خرید رو آپدیت می‌کنه"
  on purchases for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============ subscriptions (اشتراک ماهانه/سالانه) ============

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  plan subscription_plan not null,
  status subscription_status not null default 'active',
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "کاربر فقط اشتراک خودش رو می‌بینه"
  on subscriptions for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین اشتراک ثبت/ویرایش می‌کنه"
  on subscriptions for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین اشتراک رو آپدیت می‌کنه"
  on subscriptions for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index subscriptions_user_id_idx on subscriptions (user_id, status);

-- ============ site_settings (تنظیمات ظاهر سایت، تک‌ردیفی) ============

create table site_settings (
  id boolean primary key default true,
  constraint single_row check (id),
  site_name text not null default 'نام سایت',
  author_name text not null default 'بهرام نصیری',
  bio text not null default '',
  bio_enabled boolean not null default false,
  items_per_page int not null default 5,
  favorite_reads jsonb not null default '[]'::jsonb,
  banner_image_url text not null default '',
  share_links jsonb not null default '["print","email","telegram","whatsapp","x","copy"]'::jsonb,
  social_links jsonb not null default
    '[{"label":"ایمیل","url":"#"},{"label":"تلگرام","url":"#"},{"label":"اینستاگرام","url":"#"}]'::jsonb,
  footer_note text not null default 'تمام مقاله‌های رایگان اینجا با عشق نوشته می‌شن.',
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

-- ============ page_views (آمار بازدید کلی سایت، برای پنل ادمین) ============
-- فقط مسیر صفحه و زمان ثبت می‌شه — هیچ آی‌پی یا اطلاعات شخصی ذخیره نمی‌شه.
-- درج فقط از طریق کلید سرویس (سرور خودِ سایت) انجام می‌شه، برای همین
-- سیاست insert جداگانه‌ای لازم نیست.

create table page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on page_views (created_at desc);

alter table page_views enable row level security;

create policy "فقط ادمین بازدیدها رو می‌بینه"
  on page_views for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============ article_favorites, article_likes, article_views, article_reads ============
-- تعامل کاربر با مقاله: علاقه‌مندی، لایک، بازدید، خوانده‌شده. هر چهارتا
-- unique(user_id, article_id) دارن که رکورد تکراری ساخته نشه، و RLS طوری
-- تنظیم شده که هر کاربر فقط ردیف‌های خودش رو ببینه/بسازه/حذف کنه.

create table article_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table article_favorites enable row level security;

create policy "کاربر فقط علاقه‌مندی‌های خودش را می‌بیند"
  on article_favorites for select using (auth.uid() = user_id);

create policy "کاربر فقط برای خودش علاقه‌مندی اضافه می‌کند"
  on article_favorites for insert with check (auth.uid() = user_id);

create policy "کاربر فقط علاقه‌مندی خودش را حذف می‌کند"
  on article_favorites for delete using (auth.uid() = user_id);

create index article_favorites_user_id_idx on article_favorites (user_id, created_at desc);

create table article_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table article_likes enable row level security;

create policy "کاربر فقط لایک‌های خودش را می‌بیند"
  on article_likes for select using (auth.uid() = user_id);

create policy "کاربر فقط برای خودش لایک ثبت می‌کند"
  on article_likes for insert with check (auth.uid() = user_id);

create policy "کاربر فقط لایک خودش را حذف می‌کند"
  on article_likes for delete using (auth.uid() = user_id);

create index article_likes_user_id_idx on article_likes (user_id, created_at desc);
create index article_likes_article_id_idx on article_likes (article_id);

-- تعداد لایکِ هر مقاله باید برای همه (حتی مهمان) قابل‌دیدن باشه، ولی RLS
-- بالا فقط اجازه‌ی دیدنِ ردیف‌های خودِ کاربر رو می‌ده — برای همین یک تابع
-- SECURITY DEFINER می‌سازیم که فقط COUNT برمی‌گردونه، نه ردیف‌ها.
create or replace function get_article_like_count(p_article_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from article_likes where article_id = p_article_id;
$$;

grant execute on function get_article_like_count(uuid) to anon, authenticated;

create table article_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  last_viewed_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table article_views enable row level security;

create policy "کاربر فقط سابقه‌ی بازدید خودش را می‌بیند"
  on article_views for select using (auth.uid() = user_id);

create policy "کاربر فقط برای خودش سابقه‌ی بازدید ثبت می‌کند"
  on article_views for insert with check (auth.uid() = user_id);

create policy "کاربر فقط سابقه‌ی بازدید خودش را آپدیت می‌کند"
  on article_views for update using (auth.uid() = user_id);

create index article_views_user_id_idx on article_views (user_id, last_viewed_at desc);

create table article_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table article_reads enable row level security;

create policy "کاربر فقط مقالات خوانده‌شده‌ی خودش را می‌بیند"
  on article_reads for select using (auth.uid() = user_id);

create policy "کاربر فقط برای خودش مقاله را خوانده‌شده علامت می‌زند"
  on article_reads for insert with check (auth.uid() = user_id);

create policy "کاربر فقط تاریخ مطالعه‌ی خودش را آپدیت می‌کند"
  on article_reads for update using (auth.uid() = user_id);

create index article_reads_user_id_idx on article_reads (user_id, read_at desc);

-- ============ storage (عکس/فایل مقالات، عکس ظاهر سایت) ============

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "عکس‌های مقاله برای همه قابل دیدنه"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "فقط ادمین عکس مقاله آپلود می‌کنه"
  on storage.objects for insert
  with check (
    bucket_id = 'article-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین عکس مقاله حذف می‌کنه"
  on storage.objects for delete
  using (
    bucket_id = 'article-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-files',
  'article-files',
  true,
  52428800,
  array[
    'application/pdf',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/x-m4a',
    'audio/mp4',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do nothing;

create policy "فایل‌های مقاله برای همه قابل دیدنه"
  on storage.objects for select
  using (bucket_id = 'article-files');

create policy "فقط ادمین فایل آپلود می‌کنه"
  on storage.objects for insert
  with check (
    bucket_id = 'article-files'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین فایل حذف می‌کنه"
  on storage.objects for delete
  using (
    bucket_id = 'article-files'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "عکس‌های ظاهر سایت برای همه قابل دیدنه"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "فقط ادمین عکس ظاهر سایت آپلود می‌کنه"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین عکس ظاهر سایت حذف می‌کنه"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============ اولین ادمین ============
-- بعد از این‌که یک‌بار توی سایت با ایمیل خودتون ثبت‌نام کردید، این خط رو
-- (با ایمیل خودتون) جداگانه اجرا کنید تا نقش‌تون از 'reader' به 'admin'
-- تغییر کنه و به پنل مدیریت دسترسی داشته باشید:
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
