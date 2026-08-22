-- این همون بخشیه که برای Like/Favorite/سابقه‌ی بازدید/خوانده‌شده لازمه —
-- اگه قبلاً (قبل از بحث انتقال به Vercel) اجرا نکرده باشید، هنوز روی
-- دیتابیس نیست. فقط همین یک فایل رو، یک‌بار، توی SQL Editor همین
-- پروژه‌ی متصل‌به-Vercel اجرا کنید.
--
-- اگه قبلاً اجرا کرده باشید و دوباره اجراش کنید، فقط یه خطای بی‌ضرر
-- «از قبل وجود داره» می‌بینید و هیچ آسیبی نمی‌رسه.

create table if not exists article_favorites (
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

create index if not exists article_favorites_user_id_idx on article_favorites (user_id, created_at desc);

create table if not exists article_likes (
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

create index if not exists article_likes_user_id_idx on article_likes (user_id, created_at desc);
create index if not exists article_likes_article_id_idx on article_likes (article_id);

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

create table if not exists article_views (
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

create index if not exists article_views_user_id_idx on article_views (user_id, last_viewed_at desc);

create table if not exists article_reads (
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

create index if not exists article_reads_user_id_idx on article_reads (user_id, read_at desc);
