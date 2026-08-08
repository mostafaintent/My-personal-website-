-- این فایل رو یک‌بار توی Supabase Dashboard -> SQL Editor اجرا کنید
-- تا تمام جدول‌ها، دسترسی‌ها (RLS) و تریگرهای لازم ساخته بشن.

-- ============ enums ============

create type article_category as enum (
  'یادداشت', 'ادبیات', 'فلسفه', 'روان‌شناسی', 'تاریخ', 'عرفان', 'ترجمه'
);

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

-- ============ articles ============

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category article_category not null default 'یادداشت',
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

-- ============ اولین ادمین ============
-- بعد از این‌که یک‌بار با ایمیل خودتون ثبت‌نام کردید، این خط رو (با ایمیل خودتون) اجرا کنید
-- تا نقش‌تون از 'reader' به 'admin' تغییر کنه و به پنل مدیریت دسترسی داشته باشید:
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
