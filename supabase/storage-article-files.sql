-- این فایل رو یک‌بار توی SQL Editor اجرا کنید.
-- فضای ذخیره‌سازی برای آپلود مستقیم فایل پی‌دی‌اف، صوتی و تصویری داخل
-- مقاله می‌سازه (جدا از باکت article-images که فقط برای عکس‌های داخل متنه).
-- سقف هر فایل ۵۰ مگابایته (هم‌سطح سقف رایگان Supabase Storage).

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
